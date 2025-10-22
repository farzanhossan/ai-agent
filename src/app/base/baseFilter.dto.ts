import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class BaseFilterDTO {
  @ApiProperty({
    type: String,
    required: false,
    description: 'name',
  })
  @IsString()
  @IsOptional()
  sortBy: string;

  @ApiProperty({
    type: String,
    required: false,
    description: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly sortOrder!: 'ASC' | 'DESC';

  @IsOptional()
  readonly orOptions?: any[];
}
