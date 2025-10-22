import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { getPastDate } from '@src/shared';
import { firstValueFrom } from 'rxjs';
import { LessThan, Repository } from 'typeorm';
import { SmsLog } from '../entities/smsLog.entity';
import { SmsGatewayService } from './smsGateway.service';

@Injectable()
export class SmsService extends BaseService<SmsLog> {
  constructor(
    @InjectRepository(SmsLog)
    public readonly _repo: Repository<SmsLog>,
    private readonly http: HttpService,
    private readonly smsGatewayService: SmsGatewayService,
  ) {
    super(_repo);
  }
  async sendSmsThroughDefaultGateway(number: string, message: string) {
    // if (!ENV.isProduction) number = ENV?.test?.defaultPhoneNumber ? ENV?.test?.defaultPhoneNumber : '01998200160';
    console.info(
      `🚀 ~ SmsService ~ ~ sendSmsThroughDefaultGateway:========:======== ${number} :========:======== ${message} :========:========`,
    );
    try {
      const defaultSmsGateway = await this.smsGatewayService.findOne({
        where: {
          isActive: true,
        },
      });
      if (!defaultSmsGateway) {
        console.info('========= DEFAULT SMS GATEWAY NOT FOUND =========');
        await this.createOneBase({
          number,
          message,
          requestStatus: 'Failed',
          requestMessage: 'DEFAULT SMS GATEWAY NOT FOUND',
        })
      }
      if (defaultSmsGateway.requestMethod === 'GET') {
        const sanitizedSmsGateway = this.smsGatewayService.buildDataWithActualValues(
          defaultSmsGateway,
          number,
          message,
        );

        console.info('========= CALLING SMS GATEWAY =========');
        const responseData = this.http.get(sanitizedSmsGateway.requestEndpoint);

        console.info('========= SMS GATEWAY RESPONDING =========');
        const response = await firstValueFrom(responseData);
        console.info('🚀 ~ SmsService ~ sendSmsThroughDefaultGateway ~ response:', response?.data);
        await this.createOneBase({
          number,
          message,
          requestStatus: 'Success',
          requestMessage: 'SMS GATEWAY TRIGGERED',
          gatewayStatus: response?.data?.Text,
          gatewayResponse: response?.data
        })
        return {
          data: response?.data,
        };
      } else {
        console.error('======== METHOD NOT SUPPORTED FOR THIS GATEWAY ========');
        await this.createOneBase({
          number,
          message,
          requestStatus: 'Failed',
          requestMessage: 'REQUEST METHOD NOT SUPPORTED FOR THIS GATEWAY',
        })
        return;
      }
    } catch (error) {
      console.error('======== ERROR FROM DEFAULT SMS GATEWAY ========', error);
      await this.createOneBase({
        number,
        message,
        requestStatus: 'Failed',
        requestMessage: 'UNKNOWN EXECEPTION'
      })
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldLogs() {
    const sixtyDaysAgo = getPastDate(new Date(), 30);
    await this.delete({
      createdAt: LessThan(sixtyDaysAgo),
    });
    console.log('Deleted sms logs older than 60 days');
  }
}
