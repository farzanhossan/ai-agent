import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterUserDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number = 1;

  @ApiProperty({
    type: String,
    description: 'The search term',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({ type: String, required: false, description: '2025-04-27' })
  @IsOptional()
  joiningFrom?: any;

  @ApiProperty({ type: String, required: false, description: '2025-04-27' })
  @IsOptional()
  joiningTo?: any;

  @ApiProperty({
    type: String,
    description: 'Email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    type: String,
    description: 'Phone Number',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    type: String,
    description: 'Username',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly username?: string;

  @ApiProperty({
    type: String,
    description: 'USER ID, example: TM-1234-U',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly code?: string;

  @ApiProperty({
    type: Boolean,
    description: 'is Status active',
    required: false,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'is information visible to public',
    default: '',
    required: false,
  })
  @IsOptional()
  readonly isVisibleToPublic!: boolean;

  @ApiProperty({
    type: String,
    description: `[${Object.values(ENUM_ACL_DEFAULT_ROLES)?.join(' / ').toString()}]`,
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  roles?: string;

  @ApiProperty({
    type: String,
    description: 'courses ids ==> [courseId1, courseId2]',
    default: '',
    required: false,
  })
  @IsOptional()
  courses?: string;

  @ApiProperty({
    type: String,
    description: 'batches ids ==> [batchId1, batchId2]',
    default: '',
    required: false,
  })
  @IsOptional()
  batches?: string;

  @ApiProperty({
    type: String,
    description: 'batchSections ids ==> [batchSectionId1, batchSectionId2]',
    default: '',
    required: false,
  })
  @IsOptional()
  batchSections?: string;
}

export class FilterWebUserDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({
    type: String,
    description: 'The search term',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    description: 'Email',
    default: '',
    required: false,
  })
  @IsOptional()
  readonly email!: string;

  @IsOptional()
  roles?: string;
}
