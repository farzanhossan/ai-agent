import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'catalogs.create',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  readonly permissionType!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  @IsString()
  readonly createdBy!: any;
}
