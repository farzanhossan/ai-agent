import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.SMS_LOGS, { orderBy: { createdAt: 'DESC' } })
export class SmsLog extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  number?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  message?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  requestStatus?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  requestMessage?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  gatewayStatus?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB,
    nullable: true,
    default: {}
  })
  gatewayResponse?: any;
}


