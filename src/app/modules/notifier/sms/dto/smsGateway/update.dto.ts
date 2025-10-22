import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, } from 'class-validator';
import { ENUM_SMS_GATEWAY_REQUEST_METHOD } from '../../enum';

export class UpdateSmsGatewayDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: ENUM_SMS_GATEWAY_REQUEST_METHOD.GET
  })
  @IsOptional()
  @IsEnum(ENUM_SMS_GATEWAY_REQUEST_METHOD)
  readonly requestMethod!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'xzy.com?username=abc&password=123&recipient={{recipient}}&message={{message}}',
    description: `
    This is the endpoint where the request will be sent. Actual recipient and message will be replaced by {{recipient}} and {{message}}
    Example For GET Method: https://xzy.com?username=abc&password=123&recipient={{recipient}}&message={{message}}
    Example For POST Method: https://xzy.com
    `
  })
  @IsOptional()
  @IsString()
  readonly requestEndpoint!: any;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      username: 'abc',
      password: '123',
      recipient: '{{recipient}}',
      message: '{{message}}'
    }
  })
  @IsOptional()
  @IsObject()
  readonly requestBody!: any;

  @ApiProperty({
    type: Number,
    required: false,
    example: 587,
  })
  @IsOptional()
  @IsNumber()
  readonly internalUser!: any;

  @ApiProperty({ required: false, type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  updatedBy: any;
}
