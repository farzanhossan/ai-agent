import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
// import { ENUM_PAYMENT_FOR } from '../../transaction/enums';
import { IExtraPaymentRequestOptions } from '../interfaces';
import { ENUM_PAYMENT_GATEWAY_TYPE } from './../enums/index';

export class PaymentRequestDTO {
  @ApiProperty({
    example: ENUM_PAYMENT_GATEWAY_TYPE.AMARPAY,
    enum: ENUM_PAYMENT_GATEWAY_TYPE,
  })
  @IsNotEmpty()
  paymentGatewayType?: string;

  // @ApiProperty({
  //   example: ENUM_PAYMENT_FOR.APPLICATION,
  //   enum: ENUM_PAYMENT_FOR,
  // })
  // @IsNotEmpty()
  // paymentFor?: string;

  @ApiProperty({ example: 'order_code_1' })
  @IsNotEmpty()
  orderId?: string;

  // @ApiProperty({ example: 1 })
  // @IsNumber()
  // @IsNotEmpty()
  // applicationId?: number;

  @ApiProperty({ example: 'U-2311292271' })
  @IsOptional()
  @IsString()
  applicationUnifiedCode?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  b2bSubscriptionRequest?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  internalUser?: number;

  @ApiProperty({ example: 'https://demo.com.bd' })
  @IsNotEmpty()
  originUrl?: string;

  @ApiProperty({ example: 'https://demo.com.bd/orders', description: 'Frontend Callback URL' })
  @IsNotEmpty()
  webCallbackUrl?: string;

  @ApiProperty({ example: 'Red XXL Raymond Shirt' })
  @IsNotEmpty()
  orderDescription?: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  amount?: number;

  @ApiProperty({ example: 50 })
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ example: 50 })
  @IsOptional()
  productAmount?: number;

  @ApiProperty({ example: 'Zahid Hasan' })
  @IsNotEmpty()
  customerName?: string;

  @ApiProperty({ example: 'zahidhasan065@gmail.com' })
  @IsNotEmpty()
  customerEmail?: string;

  @ApiProperty({ example: '01636476123' })
  @IsNotEmpty()
  customerPhoneNumber?: string;

  @ApiProperty({
    example: {
      customerAddress1: 'Address 1',
      customerAddress2: 'Address 2',
      customerCity: 'Dhaka',
      customerCountry: 'BD',
    },
  })
  @IsOptional()
  extras?: IExtraPaymentRequestOptions;

  @IsOptional()
  createdBy?: any;
}
