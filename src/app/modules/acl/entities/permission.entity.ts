import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { PermissionType } from './permissionType.entity';

@Entity(ENUM_TABLE_NAMES.PERMISSIONS, { orderBy: { createdAt: 'DESC' } })
export class Permission extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column()
  title?: string;

  @ManyToOne((t) => PermissionType, { onDelete: 'NO ACTION' })
  @Type((t) => PermissionType)
  permissionType?: PermissionType;

  @RelationId((e: Permission) => e.permissionType)
  permissionTypeId?: string;

  isAlreadyAdded?: boolean = false;

  constructor() {
    super();
  }
}
