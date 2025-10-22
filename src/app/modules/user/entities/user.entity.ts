import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from './userRole.entity';

@Entity(ENUM_TABLE_NAMES.USERS)
export class User extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'email',
    'username',
    'phoneNumber',
    'firstName',
    'lastName',
    'fullName',
  ];

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: true })
  gender?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isTwoFactorEnabled?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  twoFactorSecret?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isOtpVerified?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  otpVerificationMethod?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isOtpVerificationRequired?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  authProvider?: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ select: false, nullable: true })
  rawPassword?: string;

  @Column({ select: false, nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  accessToken?: string;

  @Column({ select: false, nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  permissionToken?: string;

  @Column({ select: false, nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  refreshToken?: string;

  @Column({
    nullable: true,
    type: ENUM_COLUMN_TYPES.JSONB,
    comment: `[{ line1: "Line One", line2?: "Line Two", city: 'City', state: "State", zip: "Zip", country: "Country" }]`,
  })
  address?: any;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  dob?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  joiningDate?: string;

  @Column({
    nullable: true,
    type: ENUM_COLUMN_TYPES.JSONB,
    comment: `[{ name: "Institute Name", degree: "Degree Name", major: "Major Name", fromDate: "From Date", toDate: "To Date" }]`,
  })
  institutes?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  nationality?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  nationalIdentity?: string;

  @Column({
    nullable: true,
    type: ENUM_COLUMN_TYPES.JSONB,
    comment: `[{ name: "Jon Doe", phoneNumber: "+0000000000000", relationship: 'Friend' }]`,
  })
  emergencyContact?: any;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isVisibleToPublic?: boolean;

  @OneToMany((t) => UserRole, (e) => e.user)
  @Type((t) => UserRole)
  userRoles?: UserRole[];

  constructor() {
    super();
  }
}
