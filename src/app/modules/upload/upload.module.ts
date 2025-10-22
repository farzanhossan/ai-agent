import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';

const SERVICES = [UploadService];

const SUBSCRIBERS = [];

const CONTROLLERS = [UploadController];

const ENTITIES = [];

@Module({
  imports: [
    TypeOrmModule.forFeature(ENTITIES)
  ],
  providers: [...SERVICES, ...SUBSCRIBERS],
  controllers: [...CONTROLLERS],
  exports: [...SERVICES],
})
export class UploadModule { }
