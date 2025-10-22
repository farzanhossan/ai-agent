import { BaseEntity } from '@src/app/base/base.entity';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.PAYMENT_GATEWAY_LOGS, { orderBy: { createdAt: 'DESC' } })
export class PaymentGatewayLog extends BaseEntity {
  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  amount?: number;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.FLOAT, default: 0.0 })
  discountAmount?: number;

  @Column({ nullable: true })
  transactionMethod?: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  transactionTime?: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  applicationId?: number;

  @Column({ nullable: true })
  applicationUnifiedCode?: string;

  @Column({ nullable: true })
  b2bSubscriptionRequestId?: number;

  @Column({ nullable: true })
  internalUserId?: number;

  @Column({ nullable: true })
  paymentFor?: string;

  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: true })
  paymentIssuer?: string;

  @Column({ nullable: true })
  paymentGateway?: string;

  @Column({ nullable: true })
  originUrl?: string;

  @Column({ nullable: true })
  webCallbackUrl?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ nullable: true })
  paymentCurrency?: string;

  @Column({ nullable: true })
  paymentGatewayOriginalResponse?: string;

  @Column({ nullable: true })
  paymentGatewayRequestResponse?: string;

  @Column({ nullable: true })
  paymentGatewayRequestPayload?: string;

  @Column({ nullable: true, default: false })
  isSuccess?: boolean;

  constructor() {
    super();
  }
}
