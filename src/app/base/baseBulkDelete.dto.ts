import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray } from '../decorators';

export class BaseBulkDeleteDTO {
  @IsNotEmptyArray()
  @ApiProperty({ required: true, type: [String], example: ['uuid'] })
  ids: string[];
}
