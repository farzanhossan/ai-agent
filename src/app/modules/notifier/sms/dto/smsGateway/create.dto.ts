import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ENUM_SMS_GATEWAY_REQUEST_METHOD } from '../../enum';

export class CreateSmsGatewayDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: ENUM_SMS_GATEWAY_REQUEST_METHOD.GET
  })
  @IsNotEmpty()
  @IsEnum(ENUM_SMS_GATEWAY_REQUEST_METHOD)
  readonly requestMethod!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'xzy.com?username=abc&password=123&recipient={{recipient}}&message={{message}}',
    description: `
    This is the endpoint where the request will be sent. Actual recipient and message will be replaced by {{recipient}} and {{message}}
    Example For GET Method: https://xzy.com?username=abc&password=123&recipient={{recipient}}&message={{message}}
    Example For POST Method: https://xzy.com
    `
  })
  @IsNotEmpty()
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

  @ApiProperty({ required: false, type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  createdBy: any;
}
