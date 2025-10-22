import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { BcryptHelper } from '@src/app/helpers';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { gen6digitOTP } from '@src/shared';
import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserRoleService } from '../../user/services/userRole.service';
import {
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
  ResetPasswordDTO,
  VerifyResetPasswordDTO,
} from '../dtos';
import { JWTHelper } from './../../../helpers/jwt.helper';
import { UserService } from './../../user/services/user.service';
import { ChangePasswordDTO } from './../dtos/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
    private readonly jwtHelper: JWTHelper,
    private readonly bcryptHelper: BcryptHelper,
    private readonly http: HttpService,
  ) {}

  async validateUserUsingIdentifierAndPassword(
    identifier: string,
    password: string,
  ): Promise<User> {
    const user = await this.userService.findOne({
      where: [
        {
          email: identifier,
        },
        {
          phoneNumber: identifier,
        },
        {
          username: identifier,
        },
        {
          code: identifier,
        },
      ],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.bcryptHelper.compareHash(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async resetPassword(payload: ResetPasswordDTO): Promise<SuccessResponse> {
    const { email } = payload;
    const user = await this.userService.isExist({
      email,
    });

    const otp = gen6digitOTP();

    const hash = this.jwtHelper.generateOtpHash(email, otp);

    return new SuccessResponse(`OTP sent to ${email}. Please check your email.`, {
      email,
      hash,
      otp: ENV.isProduction ? null : otp,
    });
  }

  async verifyResetPassword(payload: VerifyResetPasswordDTO): Promise<SuccessResponse> {
    const { email, otp, newPassword, hash } = payload;
    const user = await this.userService.isExist({
      email,
    });

    const isOtpVerified = this.jwtHelper.verifyOtpHash(email, otp, hash);

    if (!isOtpVerified) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.userService.save([
      {
        id: user.id,
        password: newPassword,
      },
    ]);

    return new SuccessResponse(`Password reset successfully. Please login`);
  }

  async changePassword(payload: ChangePasswordDTO, authUser: IAuthUser): Promise<SuccessResponse> {
    const { oldPassword, newPassword } = payload;

    const isExist = await this.userService.findOne({
      where: { id: authUser.id },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'phoneNumber'],
    });

    if (!isExist) {
      throw new BadRequestException('User does not exists');
    }

    const isPasswordMatched = await this.bcryptHelper.compareHash(oldPassword, isExist.password);

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid old password');
    }

    await this.userService.save([
      {
        id: isExist.id,
        password: newPassword,
      },
    ]);

    return new SuccessResponse(`Password changed successfully. Please login`);
  }

  async registerUser(payload: RegisterDTO): Promise<SuccessResponse> {
    const user = await this.userService.registerUser(payload);
    return new SuccessResponse('User registered successfully. Please login', user);
  }

  async refreshToken(payload: RefreshTokenDTO): Promise<SuccessResponse> {
    const decoded = this.jwtHelper.verifyRefreshToken(payload.refreshToken);
    if (!decoded.user || !decoded.user.id) {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.userService.findOne({
      where: {
        id: decoded.user.id,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'phoneNumber'],
    });

    const { data: userRoles } = await this.userRoleService.findAllBase(
      {
        user: user.id as any,
      },
      {
        relations: ['role'],
        // withoutPaginate: true,
      },
    );
    // as UserRole[];

    const roles = userRoles.map((uR) => uR.role.title);
    const permissions = await this.userRoleService.getUserPermissions(user.id);

    const tokenPayload = {
      user: {
        id: user.id,
        roles,
      },
    };

    const refreshTokenPayload = {
      user: {
        id: user.id,
      },
      isRefreshToken: true,
    };

    const permissionTokenPayload = {
      permissions,
    };

    const token = this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload);
    const permissionToken = this.jwtHelper.makePermissionToken(permissionTokenPayload);

    return new SuccessResponse('Refresh token success', {
      token,
      refreshToken,
      permissionToken,
      user: ENV.isProduction ? null : { ...tokenPayload.user },
    });
  }

  async getUserRolePermissions(user: string): Promise<any> {
    const { data: userRoles } = await this.userRoleService.findAllBase(
      {
        user: {
          id: user,
        },
      },
      {
        relations: ['role'],
        // withoutPaginate: true,
      },
    );
    //  as UserRole[];

    const roles = userRoles.map((uR) => uR.role.title);
    const permissions = await this.userRoleService.getUserPermissions(user);
    return {
      roles,
      permissions,
    };
  }

  async loginUser(payload: LoginDTO): Promise<SuccessResponse> {
    const user = await this.userService.loginUser(payload);

    const { roles, permissions } = await this.getUserRolePermissions(user?.id);

    const tokenPayload = {
      user: {
        id: user.id,
        identifier: payload?.identifier,
        roles,
        permissions,
      },
    };

    const refreshTokenPayload = {
      user: {
        id: user.id,
      },
      isRefreshToken: true,
    };

    const permissionTokenPayload = {
      permissions,
    };

    const token = this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload);
    const permissionToken = this.jwtHelper.makePermissionToken(permissionTokenPayload);

    return new SuccessResponse('Login success', {
      token,
      refreshToken,
      permissionToken,
      user: ENV.isProduction ? null : { ...tokenPayload.user },
    });
  }
}
