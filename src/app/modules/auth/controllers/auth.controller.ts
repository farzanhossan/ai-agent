import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { IAuthUser } from '@src/app/interfaces';
import {
  ChangePasswordDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
  ResetPasswordDTO,
  VerifyResetPasswordDTO,
} from '../dtos';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  async loginUser(@Body() body: LoginDTO) {
    return this.service.loginUser(body);
  }

  @Public()
  @Post('register')
  async registerUser(@Body() body: RegisterDTO) {
    return this.service.registerUser(body);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDTO) {
    return this.service.refreshToken(body);
  }

  @Public()
  @Post('reset-password-request')
  async resetPassword(@Body() body: ResetPasswordDTO) {
    return this.service.resetPassword(body);
  }

  @Public()
  @Post('reset-password-verify')
  async verifyPassword(@Body() body: VerifyResetPasswordDTO) {
    return this.service.verifyResetPassword(body);
  }

  @Patch('change-password')
  async changePassword(@Body() body: ChangePasswordDTO, @AuthUser() authUser: IAuthUser) {
    return this.service.changePassword(body, authUser);
  }
}
