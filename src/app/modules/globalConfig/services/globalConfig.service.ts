import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, Repository } from 'typeorm';
import { GlobalConfig } from '../entities/globalConfig.entity';

@Injectable()
export class GlobalConfigService extends BaseService<GlobalConfig> {
  constructor(
    @InjectRepository(GlobalConfig)
    private readonly _repo: Repository<GlobalConfig>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  async getConfigs(): Promise<GlobalConfig> {
    const configs = await this.find();
    if (!configs[0]) {
      throw new NotFoundException(
        'Configuration parameters are missing. Please check configurations !!!',
      );
    }
    return configs[0];
  }

  async updateOne(id, data): Promise<GlobalConfig> {
    console.log("🚀 ~ GlobalConfigService ~ updateOne ~ data:", data);
  
    const config = await this.findByIdBase(id);
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }
  
    const updated = await this.updateOneBase(id, data);
    const prefix = data.hasOwnProperty('userCodePrefix') ? data.userCodePrefix : undefined;
    const suffix = data.hasOwnProperty('userCodeSuffix') ? data.userCodeSuffix : undefined;
  
    if (prefix !== undefined || suffix !== undefined) {
      const users = await this.dataSource.query(`SELECT id, code FROM users`);
  
      for (const user of users) {
        if (!user?.code) continue;
  
        const parts = user.code.split('-');
        let originalParts = [...parts]; // copy for comparison
  
        let currentPrefix = parts.length === 3 ? parts[0] : parts.length === 2 && prefix ? parts[0] : null;
        let currentMain =
          parts.length === 3 ? parts[1]
          : parts.length === 2 ? (prefix ? parts[1] : parts[0])
          : parts[0];
        let currentSuffix = parts.length === 3 ? parts[2] : parts.length === 2 && !prefix ? parts[1] : null;
  
        let shouldUpdate = false;
  
        // Update prefix
        let newPrefix = currentPrefix;
        if (prefix === null || prefix === '') {
          newPrefix = null;
          if (currentPrefix) shouldUpdate = true;
        } else if (prefix !== undefined && prefix !== currentPrefix) {
          newPrefix = prefix;
          shouldUpdate = true;
        }
  
        // Update suffix
        let newSuffix = currentSuffix;
        if (suffix === null || suffix === '') {
          newSuffix = null;
          if (currentSuffix) shouldUpdate = true;
        } else if (suffix !== undefined && suffix !== currentSuffix) {
          newSuffix = suffix;
          shouldUpdate = true;
        }
  
        const newCodeParts = [
          ...(newPrefix ? [newPrefix] : []),
          currentMain,
          ...(newSuffix ? [newSuffix] : []),
        ];
        const newUserCode = newCodeParts.join('-');
  
        if (shouldUpdate) {
          console.log("🚀 ~ Updating User ID:", user.id, "New Code:", newUserCode);
          await this.dataSource.query(
            `UPDATE users SET code = $1 WHERE id = $2`,
            [newUserCode, user.id]
          );
        }
      }
    }
  
    return updated;
  }
}
