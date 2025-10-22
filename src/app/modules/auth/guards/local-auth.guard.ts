import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@src/app/decorators/publicRoute.decorator';
import { RequestMethods } from '@src/app/enums';
import { JWTHelper } from '@src/app/helpers';
import { ENV } from '@src/env';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtHelper: JWTHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true; // 🚀 Skip auth for public routes
    if (ENV.auth.skipAuth) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.jwtHelper.extractToken(request.headers);

    const verifiedUser: any = await this.jwtHelper.verify(token);
    if (!verifiedUser) {
      throw new UnauthorizedException('Unauthorized Access Detected');
    }

    request['verifiedUser'] = verifiedUser.user;

    // if (request.method === RequestMethods.POST) {
    //   request.body.createdBy = {
    //     id: verifiedUser.user.id,
    //     identifier: verifiedUser.user.identifier,
    //   };
    // } else if (request.method === RequestMethods.PUT) {
    //   request.body.updatedBy = {
    //     id: verifiedUser.user.id,
    //     identifier: verifiedUser.user.identifier,
    //   };
    // } else if (request.method === RequestMethods.PATCH) {
    //   request.body.updatedBy = {
    //     id: verifiedUser.user.id,
    //     identifier: verifiedUser.user.identifier,
    //   };
    // }
    return true;
  }
}
