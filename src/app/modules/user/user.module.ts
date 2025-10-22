import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from './../../helpers/helpers.module';
import { AclModule } from './../acl/acl.module';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/userRole.entity';
import { UserService } from './services/user.service';
import { UserRoleService } from './services/userRole.service';
import { UserSubscriber } from './subscribers/user.subscriber';

const entities = [User, UserRole];
const services = [UserService, UserRoleService];
const subscribers = [UserSubscriber];
const controllers = [UserController];
const modules = [HelpersModule, AclModule];
const webControllers = [];
const internalControllers = [];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class UserModule {}
