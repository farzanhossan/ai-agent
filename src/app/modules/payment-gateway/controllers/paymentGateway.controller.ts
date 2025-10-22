import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentRequestDTO } from '../dtos/payment-request.dto';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '../enums';
import { IRazorpayWebHookDataFromCallback } from '../razorpay/razorpay.interfaces';
import { PaymentGatewayService } from '../services/paymentGateway.service';

@ApiTags('Payment Gateway')
@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly service: PaymentGatewayService) {}

  @Post('payment-request')
  async paymentRequest(@Body() data: PaymentRequestDTO): Promise<any> {
    const response = await this.service.paymentRequest(data);
    console.log('🚀 ~ PaymentGatewayController ~ paymentRequest ~ response:', response);
    return response;
  }

  @Post('ssl/callback-url')
  async onSSLCommerzCallbackUrl(
    @Body() body: any,
    @Query() query: any,
    @Res() res: any,
  ): Promise<any> {
    // console.log('🚀 ~ PaymentGatewayController ~ query:', query);
    // console.log('🚀 ~ PaymentGatewayController ~ body:', body);
    console.log('====================');
    console.log('====================');
    console.log('====================');
    const url = await this.service.onSSLCommerzCallbackUrl(body, query);
    // console.log('🚀 ~ PaymentGatewayController ~ url:', url);
    res.redirect(url);
  }

  @Post('ssl/webhook')
  async onSSLCommerzHook(@Body() body: any, @Query() query: any): Promise<any> {
    console.log('🚀 ~ PaymentGatewayController ~ onSSLCommerzHook ~ query:', query);
    console.log('🚀 ~ PaymentGatewayController ~ onSSLCommerzHook ~ body');
    // console.log('🚀 ~ PaymentGatewayController ~ onSSLCommerzHook ~ body:', body);
    console.log('====================');
    console.log('====================');
    console.log('====================');
    console.log('====================');
    console.log('====================');
    console.log('====================');
    let message = null;

    if (body.status === 'VALID') {
      const responseData = await this.service.onSuccessfulPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body,
        body.tran_id,
      );
      message = 'Success';
    } else if (body.status === 'CANCELLED' || 'UNATTEMPTED') {
      const responseData = await this.service.onCancelPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body.order_id,
        body,
      );
      message = 'Cancelled';
    } else if (body.status === 'FAILED') {
      const responseData = await this.service.onFailedPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body,
        body.order_id,
      );
      message = 'Failed';
    }
    return { message };
  }

  @Get('razorpay/callback-url')
  async onRazorpayCallbackUrl(
    @Query() query: IRazorpayWebHookDataFromCallback,
    @Res() res: any,
  ): Promise<any> {
    const url = await this.service.onRazorpayCallbackUrl(query);
    res.redirect(url);
  }

  @Post('razorpay/webhook')
  async onRazorpayHook(@Body() body: any): Promise<any> {
    let message = null;

    if (body?.payload?.payment_link?.entity?.status === 'paid') {
      const responseData = await this.service.onSuccessfulPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY,
        body,
        body?.payload?.payment_link?.entity?.reference_id,
      );
      message = 'Success';
    } else if (body?.payload?.payment_link?.entity?.status === 'cancelled') {
      const responseData = await this.service.onCancelPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY,
        body?.payload?.payment_link?.entity?.reference_id,
        body,
      );
      message = 'Cancelled';
    } else if (body?.payload?.payment_link?.entity?.status === 'failed') {
      const responseData = await this.service.onFailedPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY,
        body,
        body?.payload?.payment_link?.entity?.reference_id,
      );
      message = 'Failed';
    }
    return { message };
  }

  @Get('ngenius/callback-url')
  async onNgeniusCallbackUrl(@Query() query: any, @Res() res: any): Promise<any> {
    const url = await this.service.onNgeniusCallbackUrl(query);
    console.log('🚀 ~ PaymentGatewayController ~ onNgeniusCallbackUrl ~ url:', url);
    res.redirect(url);
  }

  @Post('ngenius/webhook')
  async onNgeniusHook(@Body() body: any): Promise<any> {
    console.log('🚀 ~ PaymentGatewayController ~ onNgeniusHook ~ body:', body);
    const validatePayment = await this.service.validateNgeniusPayment(body);

    let message = null;

    if (validatePayment?._embedded?.payment[0]?.state === 'PURCHASED') {
      const responseData = await this.service.onSuccessfulPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS,
        validatePayment,
        validatePayment?.merchantOrderReference,
      );
      message = 'Success';
    } else if (validatePayment?._embedded?.payment[0]?.state === 'cancelled') {
      const responseData = await this.service.onCancelPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS,
        validatePayment?.merchantOrderReference,
        validatePayment,
      );
      message = 'Cancelled';
    } else if (validatePayment?._embedded?.payment[0]?.state === 'AUTHORISED') {
      const responseData = await this.service.onFailedPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS,
        validatePayment,
        validatePayment?.merchantOrderReference,
      );
      message = 'Failed';
    }
    return { message };
  }

  // @Get('bkash/webhook/:orderId')
  // async onBkashHook(
  //   @Query() query: IBkashWebHookData,
  //   @Param('orderId') orderId: string,
  // ): Promise<any> {
  //   let redirectUrl = '';

  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  //   // console.log(
  //   //   '🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 37 ~ query.status',
  //   //   query.status,
  //   // );
  //   // console.log('🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 42 ~ query', query);
  //   if (query.status === 'success') {
  //     const responseData: any = await this.service.onSuccessfulPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
  //       query,
  //       orderId,
  //     );
  //     if (responseData.status === false) {
  //       redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${orderId}?paymentStatus=failed&message=${responseData.message}`;
  //     } else {
  //       redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=success&message=Successful`;
  //     }
  //   } else if (query.status === 'cancel') {
  //     const responseData = await this.service.onCancelPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
  //       orderId,
  //     );
  //     redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${orderId}?paymentStatus=failed&message=Payment Cancelled`;
  //   } else if (query.status === 'failure') {
  //     const responseData = await this.service.onFailedPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
  //       query,
  //       orderId,
  //     );
  //     redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${orderId}?paymentStatus=failed&message=Payment Failed`;
  //   }

  //   // console.log('🚀🚀🚀🚀🚀🚀🚀🚀 ON_SUCCESS_RESPONSE_______PAYMENT_GATEWAY', redirectUrl);

  //   return { payload: { redirectUrl } };
  // }

  // @Get('bkash/query-payment/:paymentId')
  // async onBkashQuery(@Param('paymentId') paymentId: string): Promise<any> {
  //   return this.service.bkashQueryPayment(paymentId);
  // }

  // @Get('bkash/search-payment/:trxID')
  // async onBkashSearch(@Param('trxID') trxID: string): Promise<any> {
  //   return this.service.bkashSearchPayment(trxID);
  // }

  // @Post('bkash/refund-transaction')
  // async onBkashRefundTransaction(@Body() data: any): Promise<any> {
  //   return this.service.paymentRefundForBKASH(data);
  // }

  // @Post('bkash/refund-transaction-status')
  // async onBkashRefundTransactionStatus(@Body() data: any): Promise<any> {
  //   return this.service.paymentRefundStatusForBKASH(data);
  // }

  // @Get('nagad/webhook')
  // async onNagadHook(@Query() query: INagadWebHookData): Promise<any> {
  //   let redirectUrl = '';

  //   if (query.status === 'Success') {
  //     const responseData = await this.service.onSuccessfulPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.NAGAD,
  //       query,
  //       query.order_id,
  //     );

  //     redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=success`;
  //   } else if (query.status === 'Aborted') {
  //     const responseData = await this.service.onCancelPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.NAGAD,
  //       query.order_id,
  //       query,
  //     );
  //     redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=failed`;
  //   } else if (query.status === 'UnknownFailed') {
  //     const responseData = await this.service.onFailedPayment(
  //       ENUM_PAYMENT_GATEWAY_TYPE.NAGAD,
  //       query,
  //       query.order_id,
  //     );
  //     redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=failed`;
  //   }

  //   // this.logger.info(
  //   //   '🚀🚀🚀🚀🚀🚀🚀🚀 ON_SUCCESS_RESPONSE_______PAYMENT_GATEWAY',
  //   //   redirectUrl
  //   // );

  //   // console.log(
  //   //   '🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 113 ~ redirectUrl',
  //   //   redirectUrl,
  //   // );
  //   return { payload: { redirectUrl } };
  // }

  // @Post('success/:orderId')
  // async onSuccessfulPayment(@Body() data: any, @Param('orderId') orderId: string): Promise<any> {
  //   console.log('🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 199 ~ data', data);
  //   const responseData = await this.service.onSuccessfulPayment(
  //     ENUM_PAYMENT_GATEWAY_TYPE.AMARPAY,
  //     data,
  //     orderId,
  //   );

  //   const redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=success`;
  //   console.log('🚀🚀🚀🚀🚀🚀🚀🚀 ON_SUCCESS_RESPONSE_______PAYMENT_GATEWAY', redirectUrl);

  //   // return { redirectUrl };
  //   return { payload: { redirectUrl } };
  // }

  // @Post('fail/:orderId')
  // async onFailedPayment(@Body() data: any, @Param('orderId') orderId: string): Promise<any> {
  //   const responseData = await this.service.onFailedPayment(
  //     ENUM_PAYMENT_GATEWAY_TYPE.AMARPAY,
  //     data,
  //     orderId,
  //   );

  //   const redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=failed`;
  //   console.log(
  //     '🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 151 ~ redirectUrl',
  //     redirectUrl,
  //   );

  //   // return { redirectUrl };
  //   return { payload: { redirectUrl } };
  // }

  // @Get('cancel/:orderId')
  // async onCancelPayment(@Param('orderId') orderId: string): Promise<any> {
  //   const responseData = await this.service.onCancelPayment(
  //     ENUM_PAYMENT_GATEWAY_TYPE.AMARPAY,
  //     orderId,
  //   );

  //   const redirectUrl = `${ENV.PAYMENT_REQUEST_ORIGIN_ENDPOINT}/${ENV.WEB_PANEL_ORDER_PREFIX}/${responseData.orderId}?paymentStatus=failed`;
  //   console.log(
  //     '🚀🚀🚀🚀🚀 ~ file: paymentGateway.controller.ts ~ line 168 ~ redirectUrl',
  //     redirectUrl,
  //   );

  //   // return { redirectUrl };
  //   return { payload: { redirectUrl } };
  // }
}
