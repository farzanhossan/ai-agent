import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { CreateSmsGatewayDTO, GetSmsGatewayParsedDataDTO, UpdateSmsGatewayDTO } from '../dto';
import { SmsGateway } from '../entities/smsGateway.entity';

@Injectable()
export class SmsGatewayService extends BaseService<SmsGateway> {
  constructor(
    @InjectRepository(SmsGateway)
    public readonly _repo: Repository<SmsGateway>,
  ) {
    super(_repo);
  }

  async createOne(data: CreateSmsGatewayDTO, relations: string[]): Promise<SmsGateway> {
    if (data.isActive) {
      await this.repo.update(
        { isActive: true },
        { isActive: false },
      );
    }
    return this.createOneBase(data, { relations });
  }

  async updateOne(id: string, data: UpdateSmsGatewayDTO, relations: string[]): Promise<SmsGateway> {
    const isExist = await this.findOne({ where: { id } });
    if (!isExist) {
      throw new BadRequestException('Gateway not found');
    }

    if (data.isActive) {
      await this.repo.update(
        { isActive: true },
        { isActive: false },
      );
    }
    return this.updateOneBase(id, data, { relations });
  }

  async getSmsGatewayParsedData(data: GetSmsGatewayParsedDataDTO): Promise<SmsGateway> {

    const isExist = await this.findOne({ where: { isActive: true }, });

    if (!isExist) {
      throw new BadRequestException('Gateway not found');
    }

    return this.buildDataWithActualValues(isExist, data.recipient, data.message);
  }

  buildDataWithActualValues(smsGateway: SmsGateway, recipient: string, message: string) {
    const smsId = `${recipient}-${Math.floor(1000 + Math.random() * 9000)}`;

    smsGateway.requestEndpoint = smsGateway.requestEndpoint
      .replace('{{recipient}}', recipient)
      .replace('{{message}}', message)
      .replace('{{smsId}}', smsId);
    smsGateway.requestEndpoint = encodeURI(smsGateway.requestEndpoint);
    if (smsGateway.requestBody) {
      if (smsGateway.requestBody.message) {
        smsGateway.requestBody.message = smsGateway.requestBody.message.replace(
          '{{message}}',
          message,
        );
      }
      if (smsGateway.requestBody.recipient) {
        smsGateway.requestBody.recipient = smsGateway.requestBody.recipient.replace(
          '{{recipient}}',
          recipient,
        );
      }
      if (smsGateway.requestBody.smsId) {
        smsGateway.requestBody.smsId = smsGateway.requestBody.smsId.replace('{{smsId}}', smsId);
      }
    }

    return smsGateway;
  }
}
