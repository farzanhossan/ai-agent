import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { CreateSmsGatewayDTO, FilterSmsGatewayDTO, GetSmsGatewayParsedDataDTO, UpdateSmsGatewayDTO } from '../dto';
import { SmsGateway } from '../entities/smsGateway.entity';
import { SmsGatewayService } from '../services/smsGateway.service';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('sms-gateways')
export class SmsGatewayController {
  RELATIONS = [];
  constructor(private readonly service: SmsGatewayService) { }

  @Get()
  async findAll(@Query() query: FilterSmsGatewayDTO): Promise<SuccessResponse | SmsGateway[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get('parsed-data')
  async getSmsGatewayParsedData(@Query() query: GetSmsGatewayParsedDataDTO): Promise<SmsGateway> {
    return this.service.getSmsGatewayParsedData(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<SmsGateway> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: CreateSmsGatewayDTO): Promise<SmsGateway> {
    return this.service.createOne(body, this.RELATIONS);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateSmsGatewayDTO): Promise<SmsGateway> {
    return this.service.updateOne(id, body, this.RELATIONS);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
