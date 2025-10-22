import { toBool, toNumber } from '@src/shared';
import { config } from 'dotenv';
import * as path from 'path';

config({
  path: path.join(process.cwd(), 'environments', `${process.env.NODE_ENV || 'development'}.env`),
});

export const ENV_DEVELOPMENT = 'development';
export const ENV_PRODUCTION = 'production';
export const ENV_STAGING = 'staging';
export const ENV_QA = 'qa';

export const ENV = {
  port: process.env.PORT,
  env: process.env.NODE_ENV || ENV_DEVELOPMENT,
  isProduction: process.env.NODE_ENV === ENV_PRODUCTION,
  isStaging: process.env.NODE_ENV === ENV_STAGING,
  isTest: process.env.NODE_ENV === ENV_QA,
  isDevelopment: process.env.NODE_ENV === ENV_DEVELOPMENT,

  api: {
    API_PREFIX: process.env.API_PREFIX,
    API_VERSION: process.env.API_VERSION,
    API_TITLE: process.env.API_TITLE,
    API_DESCRIPTION: process.env.API_DESCRIPTION,
  },

  security: {
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(','),
    RATE_LIMIT_TTL: toNumber(process.env.RATE_LIMIT_TTL),
    RATE_LIMIT_MAX: toNumber(process.env.RATE_LIMIT_MAX),
  },

  logger: {
    LOG_FOLDER: process.env.LOG_FOLDER,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    saltRound: toNumber(process.env.JWT_SALT_ROUNDS),
    tokenExpireIn: process.env.JWT_EXPIRES_IN,
    refreshTokenExpireIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },

  base: {
    currencyCode: process.env.BASE_CUURENCY_CODE,
    timeZone: process.env.BASE_TIMEZONE,
    apiEndpoint: process.env.BASE_API_ENDPOINT,
  },

  db: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    synchronize: toBool(process.env.DB_SYNCHRONIZE),
    logging: toBool(process.env.DB_LOGGING),
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: toNumber(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },

  llama: {
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_MODEL,
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL,
  },

  qdrant: {
    url: process.env.QDRANT_URL,
    collection: process.env.QDRANT_COLLECTION,
  },

  aiAgent: {
    temperature: toNumber(process.env.AI_AGENT_TEMPERATURE),
    maxTokens: toNumber(process.env.AI_AGENT_MAX_TOKENS),
  },

  auth: {
    skipAuth: toBool(process.env.SKIP_AUTH),
  },

  mail: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: toNumber(process.env.SMTP_PORT),
      secure: toBool(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    },
    smtpEmail: process.env.SMTP_EMAIL,
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
    folderPrefix: process.env.S3_FOLDER_PREFIX,
  },

  UPLOAD_BASE_PUBLIC_PATH: process.env.UPLOAD_BASE_PUBLIC_PATH,
  DOWNLOAD_BASE_PUBLIC_PATH: process.env.DOWNLOAD_BASE_PUBLIC_PATH,

  seedData: {
    superAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL,
    superAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD,
  },

  sslCommerz: {
    SSL_COMMERZ_BASE_PAYMENT_URL: process.env.SSL_COMMERZ_BASE_PAYMENT_URL,
    SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL: process.env.SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL,
    SSL_COMMERZ_STORE_ID: process.env.SSL_COMMERZ_STORE_ID,
    SSL_COMMERZ_STORE_PASSWORD: process.env.SSL_COMMERZ_STORE_PASSWORD,
    SSL_COMMERZ_SUCCESS_URL: process.env.SSL_COMMERZ_SUCCESS_URL,
    SSL_COMMERZ_FAILED_URL: process.env.SSL_COMMERZ_FAILED_URL,
    SSL_COMMERZ_CANCELED_URL: process.env.SSL_COMMERZ_CANCELED_URL,
    SSL_COMMERZ_REQUEST_TYPE: process.env.SSL_COMMERZ_REQUEST_TYPE,
    SSL_COMMERZ_CURRENCY: process.env.SSL_COMMERZ_CURRENCY,
  },
  bkash: {
    BKASH_TOKEN_URL: process.env.BKASH_TOKEN_URL,
    BKASH_CREATE_URL: process.env.BKASH_CREATE_URL,
    BKASH_EXECUTE_URL: process.env.BKASH_EXECUTE_URL,
    BKASH_PAYMENT_STATUS_URL: process.env.BKASH_PAYMENT_STATUS_URL,
    BKASH_SEARCH_TRANSACTION_URL: process.env.BKASH_SEARCH_TRANSACTION_URL,
    BKASH_REFUND_TRANSACTION_URL: process.env.BKASH_REFUND_TRANSACTION_URL,
    BKASH_APP_KEY: process.env.BKASH_APP_KEY,
    BKASH_APP_SECRET: process.env.BKASH_APP_SECRET,
    BKASH_USERNAME: process.env.BKASH_USERNAME,
    BKASH_PASSWORD: process.env.BKASH_PASSWORD,
    BKASH_WEB_HOOK_URL: process.env.BKASH_WEB_HOOK_URL,
  },
  nagad: {
    NAGAD_PUBLIC_KEY: process.env.NAGAD_PUBLIC_KEY,
    NAGAD_PRIVATE_KEY: process.env.NAGAD_PRIVATE_KEY,
    NAGAD_MERCHANT_ID: process.env.NAGAD_MERCHANT_ID,
    NAGAD_BASE_URL: process.env.NAGAD_BASE_URL,
    NAGAD_MERCHANT_NUMBER: process.env.NAGAD_MERCHANT_NUMBER,
    NAGAD_WEB_HOOK_URL: process.env.NAGAD_WEB_HOOK_URL,
  },
  razorpay: {
    RAZOR_PAY_KEY_ID: process.env.RAZOR_PAY_KEY_ID,
    RAZOR_PAY_KEY_SECRET: process.env.RAZOR_PAY_KEY_SECRET,
    RAZOR_PAY_CALLBACK_URL: process.env.RAZOR_PAY_CALLBACK_URL,
  },

  ngenius: {
    NGENIUS_API_KEY: process.env.NGENIUS_API_KEY,
    NGENIUS_ORGANIZATION_REFERENCE: process.env.NGENIUS_ORGANIZATION_REFERENCE,
    NGENIUS_ACCESS_TOKEN_URL: process.env.NGENIUS_ACCESS_TOKEN_URL,
    NGENIUS_CREATE_URL: process.env.NGENIUS_CREATE_URL?.replace(
      '$NGENIUS_ORGANIZATION_REFERENCE',
      process.env.NGENIUS_ORGANIZATION_REFERENCE,
    ),
    NGENIUS_SUCCESS_URL: process.env.NGENIUS_SUCCESS_URL,
    NGENIUS_CANCELED_URL: process.env.NGENIUS_CANCELED_URL,
    NGENIUS_FAILED_URL: process.env.NGENIUS_FAILED_URL,
    NGENIUS_VALIDATE_URL: process.env.NGENIUS_VALIDATE_URL?.replace(
      '$NGENIUS_ORGANIZATION_REFERENCE',
      process.env.NGENIUS_ORGANIZATION_REFERENCE,
    ),
  },
};

export const ormConfig = {
  type: ENV.db.type,
  host: ENV.db.host,
  port: +ENV.db.port,
  username: ENV.db.username,
  password: ENV.db.password,
  database: ENV.db.database,
  synchronize: ENV.db.synchronize,
  logging: ENV.db.logging,
  autoLoadEntities: true,
};
