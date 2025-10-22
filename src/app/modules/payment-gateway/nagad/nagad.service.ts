import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import * as ip from 'ip';
import { firstValueFrom } from 'rxjs';
import { CURRENCY_CODE, NAGAD_CLIENT } from './nagad.constants';
import {
  INagadInitPaymentData,
  INagadInitPaymentRequest,
  INagadOptions,
  INagadPlaceOrderPaymentRequest,
} from './nagad.interfaces';
import { createHash, decrypt, encrypt, genKeys, getDate, sign } from './nagad.utils';
import { ENV } from '@src/env';

@Injectable()
export class NagadService {
  private baseUrl: string;
  private publicKey: string;
  private privateKey: string;
  private merchantId: string;
  private merchantNumber: string;

  constructor(
    @Inject(NAGAD_CLIENT)
    private readonly options: INagadOptions,
    private readonly http?: HttpService,
  ) {
    this.baseUrl = options.baseUrl;
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
    this.merchantId = options.merchantId;
    // this.merchantNumber = options.merchantNumber;
  }

  async initPayment(
    data: INagadInitPaymentRequest,
  ): Promise<{ callBackUrl: string; paymentReferenceId: string } | any> {
    try {
      const url = `${this.baseUrl}/check-out/initialize/${this.merchantId}/${data.orderId}`;
      const { privateKey, publicKey } = genKeys(this.publicKey, this.privateKey);

      const plainSensitiveData = {
        merchantId: this.merchantId,
        orderId: data.orderId,
        challenge: createHash(data.orderId),
        datetime: getDate(),
      };

      const payload = {
        // accountNumber: this.merchantNumber,
        dateTime: getDate(),
        sensitiveData: encrypt(plainSensitiveData, publicKey),
        signature: sign(plainSensitiveData, privateKey),
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': ip.address(),
        'X-KM-Client-Type': 'PC_WEB',
      };

      const response = await this.http.post(url, payload, {
        headers,
      });

      const responseData: INagadInitPaymentData = await (await firstValueFrom(response)).data;

      console.log('🚀🚀🚀🚀🚀 ~ file: nagad.service.ts ~ line 77 ~ responseData', responseData);
      const decryptedResponse = decrypt(responseData?.sensitiveData, privateKey);
      console.log(
        '🚀🚀🚀🚀🚀 ~ file: nagad.service.ts ~ line 84 ~ decryptedResponse',
        decryptedResponse,
      );

      responseData.paymentReferenceId = decryptedResponse?.paymentReferenceId;
      responseData.acceptDateTime = decryptedResponse?.acceptDateTime;
      responseData.challenge = decryptedResponse?.challenge;

      const placeOrderResponseData = await this.placeOrder({
        orderId: data.orderId,
        amount: data.amount,
        paymentRefId: responseData.paymentReferenceId,
        challenge: responseData.challenge,
      });

      return {
        ...placeOrderResponseData,
        paymentReferenceId: responseData.paymentReferenceId,
      };
    } catch (error) {
      console.log(error?.response?.data);
      return false;
    }
  }

  async placeOrder(data: INagadPlaceOrderPaymentRequest): Promise<{ callBackUrl: string } | any> {
    try {
      const url = `${this.baseUrl}/check-out/complete/${data.paymentRefId}`;
      const { privateKey, publicKey } = genKeys(this.publicKey, this.privateKey);

      const plainSensitiveData = {
        merchantId: this.merchantId,
        orderId: data.orderId,
        amount: data.amount,
        currencyCode: CURRENCY_CODE,
        challenge: data.challenge,
      };

      const payload = {
        // accountNumber: this.merchantNumber,
        merchantCallbackURL: ENV.nagad.NAGAD_WEB_HOOK_URL,
        // additionalMerchantInfo: {
        //   serviceName: 'TEST',
        // },
        sensitiveData: encrypt(plainSensitiveData, publicKey),
        signature: sign(plainSensitiveData, privateKey),
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': ip.address(),
        'X-KM-Client-Type': 'PC_WEB',
      };

      const response = await this.http.post(url, payload, {
        headers,
      });

      const responseData: any = await (await firstValueFrom(response)).data;

      return responseData;
    } catch (error) {
      console.log(error?.response?.data);
      return false;
    }
  }
}
