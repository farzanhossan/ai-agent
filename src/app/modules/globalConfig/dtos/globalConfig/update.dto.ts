import { ApiProperty } from '@nestjs/swagger';
// import { ArrayObjectCanNotBeSame } from '@src/app/decorators';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GradeScaleConfigDto {
  @ApiProperty({
    type: Number,
    required: true,
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  maxScore?: number = 0;

  @ApiProperty({
    type: Number,
    required: true,
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  minScore?: number = 0;

  @ApiProperty({
    type: String,
    required: true,
    example: 'A',
  })
  @IsNotEmpty()
  @IsString()
  letter: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 30,
  })
  @IsNumber()
  cgpa?: number = 0;
}

export class UpdateGlobalConfigDTO {
  @ApiProperty({
    type: [GradeScaleConfigDto],
    required: false,
  })
  @ValidateNested()
  @Type(() => GradeScaleConfigDto)
  @IsOptional()
  @IsArray()
  // @ArrayObjectCanNotBeSame<GradeScaleConfigDto>('letter')
  readonly gradingScale!: GradeScaleConfigDto[];

  @ApiProperty({
    type: String,
    required: false,
    example: 'K',
  })
  @IsOptional()
  @IsString()
  userCodePrefix: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'ANY',
  })
  @IsOptional()
  @IsString()
  userCodeSuffix: string;

  @ApiProperty({ type: Array, example: ['Sunday', 'Monday'] })
  @Transform(({ value }) => value.join(','))
  @IsOptional()
  weekdayConfig?: string[];

  @IsOptional()
  @IsNumber()
  readonly updatedBy!: any;
}
