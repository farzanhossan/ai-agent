import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateGlobalConfigDTO } from '../dtos';
import { GlobalConfig } from '../entities/globalConfig.entity';
import { GlobalConfigService } from '../services/globalConfig.service';

@ApiTags('GlobalConfig')
@ApiBearerAuth()
@Controller('/global-configs')
export class GlobalConfigController {
  constructor(private readonly service: GlobalConfigService) {}

  @Get()
  async find() {
    return this.service.getConfigs();
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateGlobalConfigDTO,
  ): Promise<GlobalConfig> {
    return this.service.updateOne(id, body);
  }
}
