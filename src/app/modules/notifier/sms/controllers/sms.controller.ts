import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { FilterSmsLogDTO, SendSmsDTO } from '../dto';
import { SmsLog } from '../entities/smsLog.entity';
import { SmsService } from '../services/sms.service';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('sms')
export class SmsController {
  constructor(private readonly service: SmsService) { }

  @Get('logs')
  async findAll(@Query() query: FilterSmsLogDTO): Promise<SuccessResponse | SmsLog[]> {
    return this.service.findAllBase(query);
  }

  @Post('send')
  async sendSmsThroughDefaultGateway(@Body() body: SendSmsDTO) {
    return this.service.sendSmsThroughDefaultGateway(body.phone, body.message);
  }
}
