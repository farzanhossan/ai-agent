import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ENUM_NOTIFIER_TYPE } from '../../enums';

export class CreateNotifierDTO {
  @ApiProperty({
    required: true,
    example: 'application',
    enum: ENUM_NOTIFIER_TYPE,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_NOTIFIER_TYPE)
  readonly type!: string;

  @ApiProperty({
    required: true,
    example: 'This is the title of the Notifier.',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    required: true,
    example: 'This is the content of the Notifier.',
  })
  @IsNotEmpty()
  @IsString()
  readonly content!: string;

  @ApiProperty({
    required: false,
    example: { key: 'value' },
  })
  @IsOptional()
  @Type(() => Object)
  readonly meta?: any;

  @ApiProperty({
    required: false,
    example: { key: 'value' },
  })
  @IsOptional()
  @Type(() => Object)
  readonly data?: any;

  @ApiProperty({
    type: String,
    description: 'user id',
    example: "429b26cc-ce0b-415a-ac46-94454fef8a1e",
    required: true,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  user?: any;

  @IsOptional()
  createdBy?: any;
}

export class SendNotifierDTO extends CreateNotifierDTO {
  @ApiProperty({
    type: Array,
    description: 'Users (List of user ids) to send the notifier to',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(null, { each: true })
  users?: any[];
}