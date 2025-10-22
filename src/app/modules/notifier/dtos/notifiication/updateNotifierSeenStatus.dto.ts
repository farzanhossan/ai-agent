import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray, IsUUIDArray } from '@src/app/decorators';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNotificationStatusDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: ["429b26cc-ce0b-415a-ac46-94454fef8a1e", "429b26cc-ce0b-415a-ac46-94454fef8a1e"]
  })
  @IsUUIDArray()
  @IsNotEmptyArray()
  ids: string[];

  @ApiProperty({
    example: true,
    description: 'Indicates whether the notification has been seen',
  })
  @IsBoolean()
  @IsNotEmpty()
  isSeen: boolean;

  @IsOptional()
  updatedBy?: any;
}
