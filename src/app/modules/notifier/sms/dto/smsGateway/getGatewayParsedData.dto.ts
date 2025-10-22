import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetSmsGatewayParsedDataDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '0123456789',
  })
  @IsNotEmpty()
  @IsString()
  readonly recipient!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Hello World!',
  })
  @IsNotEmpty()
  @IsString()
  readonly message!: string;

  @ApiProperty({
    type: String,
    description: 'user id',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly internalUser?: any;
}
