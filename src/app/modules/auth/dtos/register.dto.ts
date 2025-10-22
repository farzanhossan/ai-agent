import { ApiProperty } from '@nestjs/swagger';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'email/username/phoneNumber',
  })
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Zahid',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Hasan',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: ENUM_ACL_DEFAULT_ROLES.PARTICIPANT,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_ACL_DEFAULT_ROLES)
  readonly role!: string;
}
