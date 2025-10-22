import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray } from '@src/app/decorators';
import { IsStringArray } from '@src/app/decorators/isStringArray.decorator';

export class RemovePermissionsDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: [1, 2],
  })
  @IsNotEmptyArray()
  @IsStringArray()
  permissions!: string[];
}
