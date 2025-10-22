import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray } from '@src/app/decorators';
import { IsOptional } from 'class-validator';

export class AssignLeaveBalancesDTO {
  @IsNotEmptyArray()
  @ApiProperty({ required: true, type: [String], example: ['uuid'] })
  ids: string[];

  @IsOptional()
  readonly createdBy!: any;
}
