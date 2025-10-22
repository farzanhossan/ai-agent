import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { BcryptHelper } from '@src/app/helpers';
import { IFindAllBaseOptions } from '@src/app/interfaces';
import { ENUM_ACL_DEFAULT_ROLES, generateCode, identifyIdentifier } from '@src/shared';
import { isNotEmptyObject } from 'class-validator';
import { DataSource, In, Repository } from 'typeorm';
import { AsyncForEach } from 'utils-friendly';
import { FilterRoleDTO } from '../../acl/dtos';
import { RoleService } from '../../acl/services/role.service';
import { LoginDTO, RegisterDTO } from '../../auth/dtos';
import { GlobalConfigService } from '../../globalConfig/services/globalConfig.service';
import {
  CreateRolesDTO,
  CreateUserDTO,
  FilterUserDTO,
  UpdateRolesDTO,
  UpdateUserDTO,
} from '../dtos';
import { User } from '../entities/user.entity';
import { UserRole } from './../entities/userRole.entity';
import { UserRoleService } from './userRole.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly bcrypt: BcryptHelper,
    private readonly dataSource: DataSource,
    private readonly globalConfigService: GlobalConfigService,
  ) {
    super(userRepository);
  }

  async findAll(query: FilterUserDTO, options?: IFindAllBaseOptions<User>) {
    if (query?.roles) {
      const roles = JSON.parse(query.roles);
      query['userRoles'] = {
        role: {
          title: In(roles),
        },
      };
      delete query.roles;
    }

    if (query?.courses) {
      const courses = JSON.parse(query.courses);
      query['enrollments'] = {
        course: {
          id: In(courses),
        },
      };
      delete query.courses;
    }

    if (query?.batches) {
      const batches = JSON.parse(query.batches);
      query['enrollments'] = {
        batch: {
          id: In(batches),
        },
      };
      delete query.batches;
    }

    if (query?.batchSections) {
      const batchSection = JSON.parse(query.batchSections);
      query['enrollments'] = {
        batchSection: {
          id: In(batchSection),
        },
      };
      delete query.batchSections;
    }

    if (query?.joiningFrom) {
      const joiningFrom = query.joiningFrom;
      const joiningTo = query.joiningTo || new Date();
      query['joiningDate'] = {
        $gte: joiningFrom,
        $lte: joiningTo,
      };
      delete query?.joiningFrom;
      delete query?.joiningTo;
    }

    return this.findAllBase(query as any, options);
  }

  async availableRoles(id: string, payload: FilterRoleDTO): Promise<any> {
    const isExist = await this.isExist({ id });

    const { data: roles } = await this.roleService.findAllBase(payload);

    const userRoles = await this.userRoleService.find({
      where: {
        user: { id: isExist.id as any },
      },
    });

    if (roles && roles.length > 0) {
      roles.forEach((role) => {
        const isAlreadyAdded = userRoles.find((userRole) => userRole.roleId === role.id);
        role.isAlreadyAdded = !!isAlreadyAdded;
      });
    }

    return roles;
  }

  async createUser(payload: CreateUserDTO, relations: string[]): Promise<User> {
    const { roles, ..._userData } = payload;

    const codeFromPayload = _userData.code;

    const userData =
      payload.identifier?.length > 0
        ? await identifyIdentifier(payload.identifier, _userData)
        : _userData;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let createdUser = null;

    try {
      const isExist = await this.findOne({
        where: [
          { email: userData.email },
          { username: userData.username },
          { phoneNumber: userData.phoneNumber },
          { code: codeFromPayload },
        ],
      });

      if (isExist) {
        throw new ConflictException(
          'User already exists with this email/username/phoneNumber/code',
        );
      }

      createdUser = await queryRunner.manager.save(
        Object.assign(new User(), {
          ...userData,
          code: codeFromPayload || (await this.generateUniqueUserCode()),
        }),
      );

      if (!createdUser) {
        throw new BadRequestException('User not created');
      }

      if (roles && roles.length) {
        await AsyncForEach(roles, async (role: CreateRolesDTO) => {
          const isRoleExist = await this.roleService.isExist({ id: role.role });
          await queryRunner.manager.save(
            Object.assign(new UserRole(), {
              user: createdUser.id,
              role: role.role,
            }),
          );
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(error.message || 'User not created');
    }

    if (!createdUser) {
      throw new BadRequestException('User not created');
    }

    const updatedUser = await this.findOne({
      where: {
        id: createdUser.id,
      },
      relations,
    });

    return updatedUser;
  }

  async updateUser(id: string, payload: UpdateUserDTO, relations: string[]): Promise<User> {
    const isUserExist = await this.isExist({ id });

    const { roles, ...userData } = payload;

    const userWithSameUniqueIdentifiers = await this.findOne({
      where: [
        { email: userData.email },
        { username: userData.username },
        { phoneNumber: userData.phoneNumber },
        { code: userData.code },
      ],
    });

    if (userWithSameUniqueIdentifiers && userWithSameUniqueIdentifiers.id !== isUserExist.id) {
      throw new ConflictException(
        'Another user already exists with this email/username/phoneNumber/code',
      );
    }

    let fullName = isUserExist.fullName;
    if (userData.firstName && userData.lastName) {
      fullName = `${userData.firstName} ${userData.lastName}`;
    } else if (userData.firstName) {
      fullName = `${userData.firstName} ${isUserExist.lastName}`;
    } else if (userData.lastName) {
      fullName = `${isUserExist.firstName} ${userData.lastName}`;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isNotEmptyObject(userData)) {
        await queryRunner.manager.update(User, { id }, { ...userData, fullName });
      }

      if (roles && roles.length > 0) {
        const deletedItems = roles.filter((role) => role.isDeleted);
        const newOrUpdatedItems = roles.filter((role) => !role.isDeleted);

        await AsyncForEach(deletedItems, async (role: UpdateRolesDTO) => {
          const isUserRoleExist = await this.userRoleService.isExist({
            user: { id },
            role: { id: role.role },
          });
          await queryRunner.manager.delete(UserRole, {
            user: { id },
            role: { id: role.role },
          });
        });

        await AsyncForEach(newOrUpdatedItems, async (role: UpdateRolesDTO) => {
          const isRoleExist = await this.roleService.isExist({
            id: role.role,
          });
          const isUserRoleExist = await this.userRoleService.findOne({
            where: {
              user: { id },
              role: { id: role.role },
            },
          });

          if (!isUserRoleExist) {
            await queryRunner.manager.save(
              Object.assign(new UserRole(), {
                user: id,
                role: role.role,
              }),
            );
          }
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(error.message || 'User not updated');
    }

    const updatedUser = await this.findOne({
      where: {
        id: id,
      },
      relations,
    });

    return updatedUser;
  }

  async findOrCreateByPhoneNumber(phoneNumber: string): Promise<User> {
    const role = await this.roleService.findOneBase({
      title: ENUM_ACL_DEFAULT_ROLES.PARTICIPANT,
    });
    const isExist = await this.findOneBase({ phoneNumber });

    if (isExist) {
      return isExist;
    } else {
      const user = await this.createOneBase({
        phoneNumber,
      });

      const userRole = await this.userRoleService.createOneBase({
        user: user.id as any,
        role: role.id as any,
      });
      return user;
    }
  }

  async registerUser(_payload: RegisterDTO): Promise<User> {
    const payload = await identifyIdentifier(_payload.identifier, _payload);
    const role = await this.roleService.findOneBase({
      title: payload.role,
    });
    const isExist = await this.findOne({
      where: [
        { email: payload.email },
        { username: payload.username },
        { phoneNumber: payload.phoneNumber },
      ],
    });

    if (isExist) {
      throw new ConflictException('User already exists with this email/username/phoneNumber');
    } else {
      const createdUser = await this.createOneBase({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload?.email || null,
        username: payload?.username || null,
        phoneNumber: payload?.phoneNumber || null,
        code: await this.generateUniqueUserCode(),
        password: payload.password,
      });

      const userRole = await this.userRoleService.createOneBase({
        user: createdUser.id as any,
        role: role.id as any,
      });
      return createdUser;
    }
  }

  async loginUser(payload: LoginDTO): Promise<User> {
    const isExist = await this.findOne({
      where: [
        { email: payload.identifier },
        { username: payload.identifier },
        { phoneNumber: payload.identifier },
        { code: payload.identifier },
      ],
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'phoneNumber',
        'username',
        'code',
      ],
    });

    if (!isExist) {
      throw new BadRequestException('User does not exists');
    }

    const isPasswordMatch = await this.bcrypt.compareHash(payload.password, isExist.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Password does not match');
    }

    return isExist;
  }

  async generateUniqueUserCode(): Promise<string> {
    const globalConfig = await this.globalConfigService.getConfigs();
    let userCode: string;
    let isExists: undefined | User;
    do {
      userCode = generateCode();
      isExists = await this.findOne({
        where: [{ code: userCode }, { username: userCode }],
      });
    } while (isExists);

    const prefix =
      globalConfig?.userCodePrefix?.length > 0 ? `${globalConfig.userCodePrefix}-` : '';
    const suffix =
      globalConfig?.userCodeSuffix?.length > 0 ? `-${globalConfig.userCodeSuffix}` : '';
    const code = `${prefix}${userCode}${suffix}`;
    return code;
  }
}
