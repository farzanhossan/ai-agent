import { Role } from '@src/app/modules/acl/entities/role.entity';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { DataSource } from 'typeorm';
import { AsyncForEach } from 'utils-friendly';

export default class RoleSeeder {
  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    await AsyncForEach(Object.values(ENUM_ACL_DEFAULT_ROLES), async (role) => {
      const isRoleExist = await this.dataSource.manager.findOne(Role, {
        where: { title: role },
      });

      if (!isRoleExist) {
        await this.dataSource.manager.save(
          Object.assign(new Role(), {
            title: role,
            isActive: true,
          }),
        );
      }
    });
  }
}
