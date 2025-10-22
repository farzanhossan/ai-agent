import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity(ENUM_TABLE_NAMES.NOTIFIERS, { orderBy: { createdAt: 'DESC' } })
export class Notifier extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  type?: string;

  @Column({ nullable: false, type: ENUM_COLUMN_TYPES.TEXT })
  title?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  content?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  meta?: any;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  data?: any;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isSeen?: boolean;

  @ManyToOne((t) => User, { onDelete: 'CASCADE', nullable: true })
  @Type((t) => User)
  user?: User;

  @RelationId((e: Notifier) => e.user)
  userId?: number;

  constructor() {
    super();
  }
}
