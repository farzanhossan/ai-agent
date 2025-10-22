import { TableColumnOptions } from 'typeorm';

export enum ENUM_TABLE_NAMES {
  PERMISSIONS = 'permissions',
  PERMISSION_TYPES = 'permission_types',
  ROLES = 'roles',
  USERS = 'users',
  USER_ROLES = 'user_roles',
  ROLE_PERMISSIONS = 'role_permissions',

  // COURSE BUILDER
  COURSE_CATEGORIES = 'course_categories',
  COURSES = 'courses',
  CHAPTERS = 'chapters',
  CHAPTER_QUESTIONS = 'chapter_questions',
  CHAPTER_ITEMS = 'chapter_items',
  CHAPTER_ITEM_QUESTIONS = 'chapter_item_questions',
  ASSIGNMENTS = 'assignments',
  ASSIGNMENT_TASKS = 'assignment_tasks',
  ASSIGNMENT_TASK_SUBMITS = 'assignment_task_submits',

  // Question Bank
  QUESTION_SETS = 'question_sets',
  QUESTION_SET_QUESTIONS = 'question_set_questions',
  QUESTIONS = 'questions',
  ANSWERS = 'answers',

  // Files
  FILES = 'files',

  // Batches
  BATCHES = 'batches',
  ENROLLMENTS = 'enrollments',
  BATCH_SECTIONS = 'batch_sections',
  COURSE_BATCH_SECTIONS = 'course_batch_sections',
  COURSE_PRICES = 'course_prices',

  // Evaluation
  EVALUATIONS = 'evaluations',
  EVALUATION_SUBMITS = 'evaluation_submits',

  // Common
  COUNTRIES = 'countries',
  PAYMENT_GATEWAYS = 'payment_gateways',
  CURRENCIES = 'currencies',
  CURRENCY_EXCHANGE_RATES = 'currency_exchange_rates',
  COUNTRY_PAYMENT_GATEWAYS = 'country_payment_gateways',
  PACKAGES = 'packages',
  PACKAGE_COURSES = 'package_courses',
  ATTENDANCES = 'attendances',
  SCHEDULES = 'schedules',
  ACADEMIC_CALENDERS = 'academic_calenders',

  // Global Config
  GLOBAL_CONFIGS = 'global_configs',

  PROMOTIONS = 'promotions',

  // Purchase
  PURCHASES = 'purchases',
  PURCHASE_ITEMS = 'purchase_items',

  // BILLINGS
  BILLS = 'bills',
  BILLING_CYCLES = 'billing_cycles',

  // Notifications
  NOTIFIERS = 'notifiers',

  SMS_GATEWAYS = 'sms_gateways',
  SMS_LOGS = 'sms_logs',

  // payment
  PAYMENT_GATEWAY_LOGS = 'payment_gateway_logs',

  // HR Management
  LEAVE_TYPES = 'leave_types',
  LEAVE_BALANCES = 'leave_balances',
  LEAVE_REQUESTS = 'leave_requests',
}

export enum ENUM_COLUMN_TYPES {
  UUID = 'uuid',
  INT = 'int',
  FLOAT = 'float',
  TEXT = 'text',
  VARCHAR = 'varchar',
  BOOLEAN = 'boolean',
  TIMESTAMP_UTC = 'timestamp without time zone',
  ENUM = 'enum',
  JSONB = 'jsonb',
  DATE = 'date',
}

export const defaultDateTimeColumns: TableColumnOptions[] = [
  {
    name: 'createdAt',
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    default: 'NOW()',
    isNullable: true,
  },
  {
    name: 'updatedAt',
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    isNullable: true,
  },
  {
    name: 'deletedAt',
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    isNullable: true,
  },
];

export const defaultColumns: TableColumnOptions[] = [
  {
    name: 'isActive',
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    isNullable: true,
    default: true,
  },
];

export const defaultPrimaryColumn: TableColumnOptions = {
  name: 'id',
  type: ENUM_COLUMN_TYPES.INT,
  isPrimary: true,
  isGenerated: true,
  generationStrategy: 'increment',
};
