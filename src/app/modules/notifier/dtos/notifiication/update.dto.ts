import { ApiProperty } from '@nestjs/swagger';
import { IsUUIDArray } from '@src/app/decorators';
import { ArrayNotEmpty, IsOptional } from 'class-validator';

export class UpdateNotifierDTO {
  @ApiProperty({
    type: [String],
    required: false,
    example: ["429b26cc-ce0b-415a-ac46-94454fef8a1e", "429b26cc-ce0b-415a-ac46-94454fef8a1e"],
  })
  @IsOptional()
  @IsUUIDArray()
  @ArrayNotEmpty()
  readonly ids!: string[];
}
