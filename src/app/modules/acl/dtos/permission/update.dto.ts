import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'catalogs.create',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsString()
  readonly permissionType!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  @IsString()
  readonly updatedBy!: any;
}
