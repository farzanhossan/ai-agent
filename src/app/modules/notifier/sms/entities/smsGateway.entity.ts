import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.SMS_GATEWAYS, { orderBy: { createdAt: 'DESC' } })
export class SmsGateway extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  requestMethod?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  requestEndpoint?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB,
    nullable: true,
  })
  requestBody?: any;

  constructor() {
    super();
  }
}


