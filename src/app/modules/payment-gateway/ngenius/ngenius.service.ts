import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NGENIUS_CLIENT } from './ngenius.constants';
import { INgeniusInitPaymentRequest, INgeniusOptions, INgeniusTokenResponse } from './ngenius.interfaces';

@Injectable()
export class NgeniusService {
  private apiKey: string;
  private organizationReference: string;
  private accessTokenUrl: string;
  private createUrl: string;
  private successUrl: string;
  private canceledUrl: string;
  private failedUrl: string;
  private validateUrl: string;

  constructor(
    @Inject(NGENIUS_CLIENT)
    private readonly options: INgeniusOptions,
    private readonly http?: HttpService,
  ) {
    this.apiKey = options.apiKey;
    this.organizationReference = options.organizationReference;
    this.accessTokenUrl = options.accessTokenUrl;
    this.createUrl = options.createUrl;
    this.successUrl = options.successUrl;
    this.canceledUrl = options.canceledUrl;
    this.validateUrl = options.validateUrl;
  }

  async createAccessToken(): Promise<INgeniusTokenResponse | any> {
    try {
      console.log('=========================================');

      const response = await this.http.post(
        this.accessTokenUrl,
        {},
        {
          headers: {
            'Content-Type': 'application/vnd.ni-identity.v1+json',
            Accept: 'application/vnd.ni-identity.v1+json',
            Authorization: `Basic ${this.apiKey}`,
          },
        },
      );
      const responseData = await (await firstValueFrom(response)).data;

      return responseData;
    } catch (error) {
      return error;
    }
  }

  async initPayment(payload: INgeniusInitPaymentRequest): Promise<any> {
    try {
      const token = await this.createAccessToken();
      console.log('🚀 ~ NgeniusService ~ initPayment ~ token:', token);
      if (token?.code && token?.code !== '200') {
        return new BadRequestException(token.message);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.access_token}`,
        'Content-Type': 'application/vnd.ni-payment.v2+json',
        Accept: 'application/vnd.ni-payment.v2+json',
      };

      const body = {
        action: 'PURCHASE',
        merchantOrderReference: payload.orderId,
        amount: {
          currencyCode: 'AED',
          // currencyCode: payload?.currency || 'AED',
          value: Number((payload.amount * 100).toFixed(2)),
          // value: 1,
        },
        emailAddress: payload.customer?.email,
        merchantAttributes: {
          redirectUrl: this.successUrl,
          cancelUrl: this.canceledUrl,
        },
        // billingAddress: {
        //   firstName: payload.customer?.name,
        // }
      };
      console.log('🚀 ~ NgeniusService ~ initPayment ~ body:', body);

      const response = await this.http.post(this.createUrl, body, { headers });

      const responseData = await (await firstValueFrom(response)).data;

      if (responseData && responseData?.status && responseData?.status !== 200) {
        return false;
      } else {
        return responseData;
      }
    } catch (error) {
      console.log('🚀 ~ NgeniusService ~ initPayment ~ error:', error?.response?.data?.errors);
      return false;
    }
  }

  async validate(payload: { ref: string }): Promise<any> {
    try {
      const token = await this.createAccessToken();
      if (token?.code && token?.code !== '200') {
        return new BadRequestException(token.message);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.access_token}`,
        // 'Content-Type': 'application/vnd.ni-payment.v2+json',
        // Accept: 'application/vnd.ni-payment.v2+json',
      };

      const response = await this.http.get(`${this.validateUrl}/${payload?.ref}`, { headers });

      const responseData = await (await firstValueFrom(response)).data;
      return responseData;
    } catch (error) {
      console.log('🚀 ~ NgeniusService ~ validate ~ error:', error);
    }
  }
}
