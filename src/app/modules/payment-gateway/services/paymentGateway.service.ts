import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ENV } from '@src/env';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayLog } from '../entities/paymentGatewayLog.entity';
import { ENUM_AMARPAY_STATUS, ENUM_PAYMENT_FOR, ENUM_PAYMENT_GATEWAY_TYPE, ENUM_PAYMENT_STATUS } from '../enums';
import { IPaymentGatewayResponse } from '../interfaces';
import { INagadInitPaymentRequest, INagadInitPaymentResponse, INagadWebHookData } from '../nagad/nagad.interfaces';
import { INgeniusInitPaymentRequest } from '../ngenius/ngenius.interfaces';
import { NgeniusService } from '../ngenius/ngenius.service';
import {
  IRazorpayInitPaymentRequest,
  IRazorpayPaymentGatewayResponse,
  IRazorpayWebHookDataFromCallback,
} from '../razorpay/razorpay.interfaces';
import { RazorpayService } from '../razorpay/razorpay.service';
import { ISSLCommerzPaymentGatewayResponse } from '../sslcommerz/sslcommerz.interfaces';
import { SSLCommerzService } from '../sslcommerz/sslcommerz.service';
import {
  IBkashInitPaymentRequest,
  IBkashInitPaymentResponse,
  IBkashRefundTransactionResponse,
  IBkashWebHookData,
} from './../bkash/bkash.interfaces';
import { BkashService } from './../bkash/bkash.service';
import { PaymentRequestDTO } from './../dtos/payment-request.dto';
import { NagadService } from './../nagad/nagad.service';
import { PaymentGatewayLogService } from './paymentGatewayLog.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly paymentLogService: PaymentGatewayLogService,
    private readonly http: HttpService,
    private readonly bkashService: BkashService,
    private readonly nagadService: NagadService,
    private readonly sslCommerzService: SSLCommerzService,
    private readonly razorpayService: RazorpayService,
    private readonly ngeniusService: NgeniusService,
  ) {}

  async bkashQueryPayment(paymentId: string): Promise<any> {
    try {
      return this.bkashService.queryPayment({ paymentID: paymentId });
    } catch (error) {
      return error;
    }
  }

  async bkashSearchPayment(trxID: string): Promise<any> {
    try {
      return this.bkashService.searchTransactionPayment(trxID);
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForSSLCOMMERZ(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload = {
        amount: data.amount,
        orderId: data.orderId,
        productCategory: data?.orderDescription || 'Product Details',
        customerName: data?.customerName || 'John Doe',
        customerEmail: data?.customerEmail || 'demo@gmail.com',
        customerAddress: data.extras?.customerAddress1 || 'Khilkhet',
        customerCity: data.extras?.customerCity || 'Dhaka',
        customerCountry: data.extras?.customerCountry || 'Bangladesh',
        customerPhoneNumber: data?.customerPhoneNumber || '01619020642',
        // discountAmount: data?.discountAmount || 0,
        productAmount: data.productAmount,
      };
      console.log('🚀 ~ PaymentGatewayService ~ paymentRequestForSSLCOMMERZ ~ payload:', payload);
      const response: ISSLCommerzPaymentGatewayResponse = await this.sslCommerzService.initPayment(payload);

      if (response.status && response.status === 'SUCCESS') {
        return {
          orderId: data.orderId,
          paymentUrl: response.redirectGatewayURL,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForRAZORPAY(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload: IRazorpayInitPaymentRequest = {
        orderId: data.orderId,
        amount: data.amount,
        currency: 'INR',
        customer: {
          name: data?.customerName || 'John Doe',
          email: data?.customerEmail || 'demo@gmail.com',
          contact: data?.customerPhoneNumber || '01619020642',
        },
        // callbackUrl: {
        //   url: 'http://[::1]:3000/api/v1/payment-gateway/razorpay/webhook/',
        //   method: 'get',
        // },
      };
      const response: IRazorpayPaymentGatewayResponse = await this.razorpayService.initPayment(payload);

      if (response.status && response.status === 'created') {
        return {
          orderId: data.orderId,
          paymentUrl: response.short_url,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForNGENIUS(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload: INgeniusInitPaymentRequest = {
        orderId: data.orderId,
        amount: data.amount,
        currency: 'AED',
        customer: {
          name: data?.customerName || 'John Doe',
          email: data?.customerEmail || 'demo@gmail.com',
          contact: data?.customerPhoneNumber || '01619020642',
        },
        // callbackUrl: {
        //   url: 'http://[::1]:3000/api/v1/payment-gateway/razorpay/webhook/',
        //   method: 'get',
        // },
      };
      console.log('🚀 ~ PaymentGatewayService ~ paymentRequestForNGENIUS ~ payload:', payload);
      const response: any = await this.ngeniusService.initPayment(payload);

      if (response && response?.status && response?.status !== 200) {
        return response;
      } else {
        return {
          orderId: data.orderId,
          paymentUrl: response?._links?.payment?.href,
        };
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForBKASH(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload: IBkashInitPaymentRequest = {
        orderId: data.orderId,
        amount: data.amount,
      };

      const response: IBkashInitPaymentResponse = await this.bkashService.initPayment(payload);
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('===============BKASH GATEWAY RESPONSE==================');
      // console.log('🚀🚀🚀🚀🚀 ~ file: paymentGateway.service.ts ~ line 93 ~ response', response);

      if (response) {
        return {
          orderId: data.orderId,
          paymentUrl: response.bkashURL,
          paymentId: response.paymentID,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForNAGAD(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload: INagadInitPaymentRequest = {
        orderId: data.orderId,
        amount: data.amount,
      };

      const response: INagadInitPaymentResponse = await this.nagadService.initPayment(payload);
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('===============NAGAD GATEWAY RESPONSE==================');
      // console.log('🚀🚀🚀🚀🚀 ~ file: paymentGateway.service.ts ~ line 118 ~ response', response);

      if (response) {
        return {
          orderId: data.orderId,
          paymentUrl: response.callBackUrl,
          paymentReferenceId: response.paymentReferenceId,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequest(data: PaymentRequestDTO): Promise<any> {
    try {
      let response = null;
      if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.BKASH) {
        response = await this.paymentRequestForBKASH(data);
      } else if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.NAGAD) {
        response = await this.paymentRequestForNAGAD(data);
      } else if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ) {
        response = await this.paymentRequestForSSLCOMMERZ(data);
      } else if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY) {
        response = await this.paymentRequestForRAZORPAY(data);
      } else if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS) {
        response = await this.paymentRequestForNGENIUS(data);
      }
      const paymentLogPayload: PaymentGatewayLog = {
        orderId: data?.orderId,
        discountAmount: data?.discountAmount || 0,
        // paymentFor: data?.paymentFor,
        applicationUnifiedCode: data?.applicationUnifiedCode,
        b2bSubscriptionRequestId: data?.b2bSubscriptionRequest,
        internalUserId: data?.internalUser,
        paymentGatewayRequestResponse: response,
        originUrl: data?.originUrl,
        webCallbackUrl: data?.webCallbackUrl,
        isSuccess: false,
        paymentGatewayRequestPayload: data as any,
      };

      await this.paymentLogService.createOneBase(paymentLogPayload);

      // console.log('🚀 ~ PaymentGatewayService ~ paymentRequest ~ response:', response);
      return response;
    } catch (error) {
      console.log('🚀 ~ file: paymentGateway.service.ts:177 ~ PaymentGatewayService ~ paymentRequest ~ error:', error);
    }

    return false;
  }

  async onSuccessfulPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    data: any,
    orderId: string,
  ): Promise<IPaymentGatewayResponse> {
    console.log('===========================');
    console.log('===========================');
    console.log('===========================');
    console.log('===========================');
    console.log('===========================');
    console.log('===========================');
    console.log('🚀 ~ PaymentGatewayService ~ orderId:', orderId);
    console.log('🚀 ~ PaymentGatewayService ~ data');
    // console.log('🚀 ~ PaymentGatewayService ~ data:', data);
    console.log('🚀 ~ PaymentGatewayService ~ paymentGatewayType:', paymentGatewayType);
    console.log('-------------------------------');
    console.log('-------------------------------');
    console.log('-------------------------------');
    console.log('-------------------------------');
    console.log('-------------------------------');
    console.log('-------------------------------');
    // console.log(
    //   '🚀 ~ file: paymentGateway.service.ts:224 ~ PaymentGatewayService ~ data:',
    //   JSON.stringify(data),
    // );
    try {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId,
        isSuccess: false,
      });
      const response: IPaymentGatewayResponse = {};

      response.orderId = orderId;
      response.paymentGatewayOriginalResponse = data;
      response.isSuccess = false;

      if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.BKASH) {
        response.amount = data?.amount;

        const payload: IBkashWebHookData = { ...data };
        const executedData = await this.bkashService.executePayment(payload);
        if (executedData && executedData.status === false) {
          // return new AppException(token.statusMessage);
          return executedData;
        }

        response.paymentGateway = executedData.paymentGateway;
        response.amount = executedData.amount;
        response.orderId = executedData.orderId;
        response.reason = executedData.reason;
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.BKASH;
        response.transactionId = executedData.transactionId;
        response.transactionTime = executedData.transactionTime;
        response.paymentGatewayOriginalResponse = executedData;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.NAGAD) {
        response.amount = data?.amount;

        const payload: INagadWebHookData = { ...data };

        response.paymentGateway = paymentGatewayType;
        response.amount = data?.amount;
        response.orderId = payload.order_id;
        response.reason = 'NAGAD';
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.NAGAD;
        response.transactionId = payload.payment_ref_id;
        response.transactionTime = payload.payment_dt;
        response.paymentGatewayOriginalResponse = payload;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ) {
        response.amount = Number(data?.amount);
        const payload: any = { ...data };

        const validateSSLCommerzEnd = await this.sslCommerzService.validate(payload);

        response.paymentGateway = paymentGatewayType;
        response.orderId = data?.tran_id;
        response.reason = '';
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ;
        response.transactionId = payload.tran_id;
        response.transactionTime = payload.tran_date;
        response.paymentGatewayOriginalResponse = payload;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
        response.applicationId = existPaymentGatewayLog?.applicationId;
        // response.paymentType = data?.card_type;
        response.paymentIssuer = data?.card_issuer;
        response.paymentMethod = data?.card_type;
        response.paymentCurrency = data?.currency;
        response.applicationUnifiedCode = existPaymentGatewayLog?.applicationUnifiedCode;
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY) {
        response.amount = Number(data?.payload?.payment_link?.entity?.amount_paid) / 100 || 0;

        const payload: any = { ...data };

        // const validateRazorpayEnd = await this.razorpayService.validate(data);

        response.paymentGateway = paymentGatewayType;
        response.orderId = orderId;
        response.reason = '';
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.RAZORPAY;
        response.transactionId = orderId;
        response.transactionTime = data?.payload?.payment_link?.entity?.updated_at;
        response.paymentGatewayOriginalResponse = payload;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
        response.paymentIssuer = data?.payload?.payment?.entity?.bank;
        response.paymentMethod = data?.payload?.payment?.entity?.method;
        response.paymentCurrency = data?.payload?.payment?.entity?.currency;
        response.applicationUnifiedCode = existPaymentGatewayLog?.applicationUnifiedCode;
        response.applicationId = existPaymentGatewayLog?.applicationId;
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS) {
        response.amount =
          Number(data?._embedded?.payment[0]?.amount?.value || data?._embedded?.payment[0]?.amount) / 100 || 0;

        const payload: any = { ...data };

        // const validateRazorpayEnd = await this.razorpayService.validate(data);

        response.paymentGateway = paymentGatewayType;
        response.orderId = orderId;
        response.reason = '';
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS;
        response.transactionId = orderId;
        response.transactionTime = data?._embedded?.payment[0]?.updateDateTime;
        response.paymentGatewayOriginalResponse = payload;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
        response.paymentIssuer = data?._embedded?.payment[0]?.bank || '';
        response.paymentMethod = data?._embedded?.payment[0]?.paymentMethod?.name;
        response.paymentCurrency = data?._embedded?.payment[0]?.amount?.currencyCode;
        response.applicationUnifiedCode = existPaymentGatewayLog?.applicationUnifiedCode;
        response.applicationId = existPaymentGatewayLog?.applicationId;
      }

      if (response.isSuccess) {
        if (existPaymentGatewayLog?.paymentFor === ENUM_PAYMENT_FOR.COURSE_ENROLLMENT) {
          const callPaymentConfirmation = this.http.post(
            `${ENV.base.apiEndpoint}/web/applications/payment-confirmation`,
            response,
          );
          console.log('🚀 ~ PaymentGatewayService ~ callPaymentConfirmation:', callPaymentConfirmation);
          await (
            await firstValueFrom(callPaymentConfirmation)
          ).data;
        }
      }

      await this.paymentLogService.updateOneBase(existPaymentGatewayLog.id, response);

      return response;
    } catch (error) {
      return error;
    }
  }

  async onFailedPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    data: any,
    orderId: string,
  ): Promise<IPaymentGatewayResponse> {
    try {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId,
      });
      const response: IPaymentGatewayResponse = {};
      if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.BKASH) {
        const payload: IBkashWebHookData = { ...data };

        response.status = ENUM_PAYMENT_STATUS.Failed;
        response.paymentGateway = paymentGatewayType;
        response.orderId = orderId;
        response.paymentGatewayOriginalResponse = payload;

        await this.paymentLogService.createOneBase(response as any);
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.NAGAD) {
        const payload: INagadWebHookData = { ...data };

        response.status = ENUM_PAYMENT_STATUS.Failed;
        response.paymentGateway = paymentGatewayType;
        response.orderId = orderId;
        response.transactionMethod = 'NAGAD';
        response.transactionId = payload?.payment_ref_id;
        response.transactionTime = payload?.payment_dt;
        response.paymentGatewayOriginalResponse = payload;

        await this.paymentLogService.createOneBase(response as any);
      }

      await this.paymentLogService.updateOneBase(existPaymentGatewayLog?.id, response);

      return response;
    } catch (error) {
      return error;
    }
  }

  async onCancelPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    orderId: string,
    query?: any,
  ): Promise<IPaymentGatewayResponse> {
    try {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId,
      });
      const response: IPaymentGatewayResponse = {};
      let paymentResponse;

      // try {
      //   paymentResponse = await this.paymentService.findSingleData({
      //     where: {
      //       orderNumberWithPrefix: orderId,
      //     },
      //   });
      // } catch (error) {
      //   this.logger.error('~~~~~~~~~~', error);
      // }

      response.status = ENUM_PAYMENT_STATUS.Canceled;
      response.paymentGateway = paymentGatewayType;
      response.orderId = orderId;

      if (query) {
        response.transactionMethod = paymentGatewayType;
        response.transactionId = query?.payment_ref_id;
        response.transactionTime = query?.payment_dt;

        response.paymentGatewayOriginalResponse = query;
      }

      await this.paymentLogService.updateOneBase(existPaymentGatewayLog?.id, response);

      // this.logger.log(response);
      return response;
    } catch (error) {
      return error;
    }
  }

  async paymentRefundForBKASH(data: any): Promise<any> {
    try {
      const payload: any = {
        paymentID: data.paymentID,
        amount: data.amount,
        trxID: data.trxID,
        sku: data.sku,
        reason: data.reason,
      };

      const response: IBkashRefundTransactionResponse = await this.bkashService.refundTransaction(payload);

      // const refundPayload: any = {
      //   amount: Number(data.amount),
      //   method: 'BKASH',
      //   transactionMethod: 'BKASH',
      //   trxID: data.trxID,
      //   refundTrxID: response?.refundTrxID,
      //   orderNumberWithPrefix: data.sku,
      //   paymentGateway: 'BKASH',
      //   reason: data.reason,
      //   paymentId: data.paymentID,
      //   paymentGatewayOriginalResponse: response,
      //   transactionTime: new Date(),
      // };
      // await getRepository(PaymentRefund, 'payment').insert(refundPayload);

      return response;
    } catch (error) {
      return error;
    }
  }

  async paymentRefundStatusForBKASH(data: any): Promise<any> {
    try {
      const payload: any = {
        paymentID: data.paymentID,
        trxID: data.trxID,
      };
      const response: IBkashRefundTransactionResponse = await this.bkashService.refundTransaction(payload);

      return response;
    } catch (error) {
      return error;
    }
  }

  async onSSLCommerzCallbackUrl(body: any, query: any): Promise<any> {
    let redirectUrl = '';

    if (body.status === 'VALID') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: body.tran_id,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=success`;
    } else if (body.status === 'CANCELLED' || 'UNATTEMPTED') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: body.order_id,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    } else if (body.status === 'FAILED') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: body.order_id,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    }
    return redirectUrl;
  }

  async onRazorpayCallbackUrl(query: IRazorpayWebHookDataFromCallback): Promise<any> {
    let redirectUrl = '';

    if (query.razorpay_payment_link_status === 'paid') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: query.razorpay_payment_link_reference_id,
      });

      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=success`;
    } else if (query.razorpay_payment_link_status === 'cancelled') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: query.razorpay_payment_link_reference_id,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    } else if (query.razorpay_payment_link_status === 'failed') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: query.razorpay_payment_link_reference_id,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    }
    return redirectUrl;
  }

  async onNgeniusCallbackUrl(query: any): Promise<any> {
    const validatePayment = await this.ngeniusService.validate(query);
    let redirectUrl = '';
    if (validatePayment?._embedded?.payment[0]?.state === 'PURCHASED') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: validatePayment?.merchantOrderReference,
      });
      //Todo Need Remove
      try {
        await this.onSuccessfulPayment(
          ENUM_PAYMENT_GATEWAY_TYPE.NGENIUS,
          validatePayment,
          validatePayment?.merchantOrderReference,
        );
      } catch (error) {
        console.log('🚀 ~ PaymentGatewayService ~ onNgeniusCallbackUrl ~ error:', error);
      }

      //Todo Need Remove

      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog?.orderId}?paymentStatus=success`;
    } else if (validatePayment?._embedded?.payment[0]?.state === 'cancelled') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: validatePayment?.merchantOrderReference,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    } else if (validatePayment?._embedded?.payment[0]?.state === 'AUTHORISED') {
      const existPaymentGatewayLog = await this.paymentLogService.isExist({
        orderId: validatePayment?.merchantOrderReference,
      });
      redirectUrl = `${existPaymentGatewayLog?.webCallbackUrl}/${existPaymentGatewayLog.orderId}?paymentStatus=failed`;
    }
    return redirectUrl;
  }

  async validateNgeniusPayment(body: any) {
    const response = await this.ngeniusService.validate(body);
    return response;
  }
}
