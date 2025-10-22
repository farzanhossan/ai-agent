import { Role } from '@src/app/modules/acl/entities/role.entity';
import { ENV, ormConfig } from '@src/env';
import { DataSource } from 'typeorm';

import { GlobalConfig } from '@src/app/modules/globalConfig/entities/globalConfig.entity';
import { User } from '@src/app/modules/user/entities/user.entity';
import { UserRole } from '@src/app/modules/user/entities/userRole.entity';
import GlobalConfigSeeder from './globalConfig.seeder';
import RoleSeeder from './role.seeder';
import UserSeeder from './user.seeder';

const dataSource = new DataSource({
  type: 'postgres',
  host: ormConfig.host,
  port: ormConfig.port,
  username: ormConfig.username,
  password: ormConfig.password,
  database: ormConfig.database,
  ssl: ENV.isProduction ? { rejectUnauthorized: false } : false,
  synchronize: ormConfig.synchronize,
  entities: [User, Role, UserRole, GlobalConfig],
});

(async () => {
  await dataSource.initialize();
  await dataSource.synchronize();

  const roleSeeder = new RoleSeeder(dataSource);
  const userSeeder = new UserSeeder(dataSource);
  const globalConfigSeeder = new GlobalConfigSeeder(dataSource);

  await roleSeeder.run();
  await userSeeder.run();
  await globalConfigSeeder.run();

  await dataSource.destroy();
})();
