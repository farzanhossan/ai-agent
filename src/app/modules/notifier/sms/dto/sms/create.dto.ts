import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSmsDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Common static message'
  })
  @IsNotEmpty()
  @IsString()
  readonly message!: string;

  @ApiProperty({
    type: String,
    required: true,
    description: `receiepent phone separated by comma for multiple ===> phone1,phone2`,
    example: `phone1,phone2`
  })
  @IsNotEmpty()
  @IsString()
  readonly phone!: string;
  
  @IsOptional()
  createdBy: any;
}
