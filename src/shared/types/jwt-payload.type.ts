import { User } from '@src/app/modules/user/entities/user.entity';

export type JwtPayloadType = {
  identifier: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
};
