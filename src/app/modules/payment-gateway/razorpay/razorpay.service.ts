import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { RAZORPAY_CLIENT } from './razorpay.constants';
import {
  IRazorpayInitPaymentRequest,
  IRazorpayOptions,
  IRazorpayPaymentGatewayResponse,
  IRazorpayWebHookDataFromCallback,
} from './razorpay.interfaces';
import { ENV } from '@src/env';
// @ts-ignore
import * as Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils';
@Injectable()
export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private razorpay: Razorpay;

  constructor(
    @Inject(RAZORPAY_CLIENT)
    private readonly options: IRazorpayOptions,
    private readonly http?: HttpService,
  ) {
    this.keyId = options.keyId;
    this.keySecret = options.keySecret;
    if (this.keyId && this.keySecret) {
      this.initializeRazorpay();
    }
  }

  private initializeRazorpay() {
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async initPayment(data: IRazorpayInitPaymentRequest): Promise<IRazorpayPaymentGatewayResponse> {
    const payload = {
      amount: data.amount * 100,
      currency: data.currency,
      expire_by: new Date().getTime() + 5 * 60 * 1000,
      reference_id: data.orderId,
      description: 'For XYZ purpose',
      customer: data.customer,
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      notes: {
        policy_name: 'VisaThing',
      },
      callback_url: ENV.razorpay.RAZOR_PAY_CALLBACK_URL,
      callback_method: 'get',
    };
    console.log(
      '🚀 ~ file: razorpay.service.ts:56 ~ RazorpayService ~ initPayment ~ payload:',
      payload,
    );
    const response = await this.razorpay.paymentLink.create(payload as any);

    return response;
  }

  async validate(payload: IRazorpayWebHookDataFromCallback) {
    const response = validatePaymentVerification(
      {
        payment_link_id: payload?.razorpay_payment_link_id,
        payment_id: payload?.razorpay_payment_id,
        payment_link_reference_id: payload?.razorpay_payment_link_reference_id,
        payment_link_status: payload?.razorpay_payment_link_status,
      },
      payload.razorpay_signature,
      this.keySecret,
    );
    return response;
  }

  async createOrder(amount: number, currency: string, orderId: string): Promise<any> {
    let response;
    try {
      response = await this.razorpay.paymentLink.create({
        amount: amount * 100,
        currency: currency,
        accept_partial: true,
        expire_by: new Date().getTime() + 5 * 60 * 1000,
        reference_id: orderId,
        description: 'For XYZ purpose',
        customer: {
          name: 'Gaurav Kumar',
          email: 'gaurav.kumar@example.com',
          contact: '+919999999991',
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          policy_name: 'Jeevan Bima',
        },
        callback_url: 'https://example-callback-url.com/',
        callback_method: 'get',
      });
    } catch (error) {
      return error;
    }
    return { link: response?.short_url, response };
  }
}
