import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.GLOBAL_CONFIGS, { orderBy: { createdAt: 'DESC' } })
export class GlobalConfig extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ nullable: true, default: null, type: ENUM_COLUMN_TYPES.VARCHAR })
  userCodePrefix?: string;

  @Column({ nullable: true, default: null, type: ENUM_COLUMN_TYPES.VARCHAR })
  userCodeSuffix?: string;
}
