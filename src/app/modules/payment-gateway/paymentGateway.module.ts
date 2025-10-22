import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayController } from './controllers/paymentGateway.controller';
import { PaymentGatewayLogController } from './controllers/paymentGatewayLog.controller';
import { PaymentGatewayLog } from './entities/paymentGatewayLog.entity';
import { PaymentGatewayService } from './services/paymentGateway.service';
import { PaymentGatewayLogService } from './services/paymentGatewayLog.service';
import { SSLCommerzModule } from './sslcommerz/sslcommerz.module';
import { ENV } from '@src/env';
import { HttpModule } from '@nestjs/axios';
import { BkashModule } from './bkash/bkash.module';
import { NagadModule } from './nagad/nagad.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { NgeniusModule } from './ngenius/ngenius.module';

const entities = [PaymentGatewayLog];
const services = [PaymentGatewayService, PaymentGatewayLogService];
const controllers = [PaymentGatewayController, PaymentGatewayLogController];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    HttpModule,
    BkashModule.register({
      tokenUrl: ENV.bkash.BKASH_TOKEN_URL,
      createUrl: ENV.bkash.BKASH_CREATE_URL,
      executeUrl: ENV.bkash.BKASH_EXECUTE_URL,
      paymentStatusUrl: ENV.bkash.BKASH_PAYMENT_STATUS_URL,
      searchTransactionUrl: ENV.bkash.BKASH_SEARCH_TRANSACTION_URL,
      refundTransactionUrl: ENV.bkash.BKASH_REFUND_TRANSACTION_URL,
      webHookUrl: ENV.bkash.BKASH_WEB_HOOK_URL,
      appKey: ENV.bkash.BKASH_APP_KEY,
      appSecret: ENV.bkash.BKASH_APP_SECRET,
      username: ENV.bkash.BKASH_USERNAME,
      password: ENV.bkash.BKASH_PASSWORD,
    }),
    NagadModule.register({
      merchantId: ENV.nagad.NAGAD_MERCHANT_ID,
      merchantNumber: ENV.nagad.NAGAD_MERCHANT_NUMBER,
      publicKey: ENV.nagad.NAGAD_PUBLIC_KEY,
      privateKey: ENV.nagad.NAGAD_PRIVATE_KEY,
      baseUrl: ENV.nagad.NAGAD_BASE_URL,
    }),
    SSLCommerzModule.register({
      storeId: ENV.sslCommerz.SSL_COMMERZ_STORE_ID,
      storePassword: ENV.sslCommerz.SSL_COMMERZ_STORE_PASSWORD,
      basePaymentUrl: ENV.sslCommerz.SSL_COMMERZ_BASE_PAYMENT_URL,
      basePaymentValidationUrl: ENV.sslCommerz.SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL,
    }),
    RazorpayModule.register({
      keyId: ENV.razorpay.RAZOR_PAY_KEY_ID,
      keySecret: ENV.razorpay.RAZOR_PAY_KEY_SECRET,
    }),
    NgeniusModule.register({
      apiKey: ENV.ngenius.NGENIUS_API_KEY,
      organizationReference: ENV.ngenius.NGENIUS_ORGANIZATION_REFERENCE,
      accessTokenUrl: ENV.ngenius.NGENIUS_ACCESS_TOKEN_URL,
      createUrl: ENV.ngenius.NGENIUS_CREATE_URL,
      successUrl: ENV.ngenius.NGENIUS_SUCCESS_URL,
      canceledUrl: ENV.ngenius.NGENIUS_CANCELED_URL,
      validateUrl: ENV.ngenius.NGENIUS_VALIDATE_URL,
    }),
  ],
  providers: [...services],
  controllers: [...controllers],
  exports: [...services],
})
export class PaymentGatewayModule {}
