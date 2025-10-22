import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterNotifierDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number = 1;

  @ApiProperty({
    type: String,
    description: 'The search term',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    description: 'The user id',
    required: false,
  })
  @IsOptional()
  @IsString()
  user!: any;

  @ApiProperty({
    type: String,
    description: 'Notification type',
    required: false,
  })
  @IsOptional()
  @IsString()
  type!: string;

  @ApiProperty({
    type: String,
    description: 'Notification seen status',
    required: false,
  })
  @IsOptional()
  @IsString()
  seen!: string;

  @ApiProperty({
    type: String,
    description: 'Notification from date',
    required: false,
  })
  @IsOptional()
  @IsString()
  from!: string;

  @ApiProperty({
    type: String,
    description: 'Notification to date',
    required: false,
  })
  @IsOptional()
  @IsString()
  to!: string;
}

export class FilterNotifierLogsDTO extends FilterNotifierDTO {
  @ApiProperty({
    type: String,
    description: 'The batch id',
    required: false,
  })
  @IsOptional()
  @IsString()
  batch!: any;
  
  @ApiProperty({
    type: String,
    description: 'The batch section id',
    required: false,
  })
  @IsOptional()
  @IsString()
  batchSection!: any;

  @ApiProperty({
    type: String,
    description: 'The course id',
    required: false,
  })
  @IsOptional()
  @IsString()
  course!: any;

  @ApiProperty({
    type: String,
    description: 'The role id',
    required: false,
  })
  @IsOptional()
  @IsString()
  role!: any;
}
