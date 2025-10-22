import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class NgeniusPaymentRequestDTO {
  @ApiProperty({ example: 'orderId_1' })
  @IsNotEmpty()
  orderId?: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  amount?: number;
}
