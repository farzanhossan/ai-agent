import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import * as fs from 'fs';
import { join } from 'path';
import { AsyncForEach } from 'utils-friendly';

@Injectable()
export class UploadService {
  BASE = join(process.cwd(), 'uploads/images');

  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: 'auto', // DigitalOcean Spaces doesn't require region
      endpoint: `https://${ENV.s3.endpoint}`, // DigitalOcean Spaces endpoint
      credentials: {
        accessKeyId: ENV.s3.accessKey,
        secretAccessKey: ENV.s3.secretKey,
      },
    });
  }

  async uploadImage(files: IFileMeta[]) {
    const uploaded = [];

    await AsyncForEach(files, async (file: IFileMeta) => {
      let imgLink = null;
      imgLink = await this.uploadToSpace({
        file,
        folder: ENV.s3.folderPrefix,
      });
      if (imgLink) uploaded.push(imgLink);
    });

    return new SuccessResponse('Uploaded successfully', uploaded);
  }

  async uploadToSpace(data: { file?: IFileMeta; folder?: string }): Promise<string> {
    try {
      const { file, folder = 'others' } = data;
      if (!file) return null;

      const filePath = file.path;
      if (!filePath) return null;

      const extension = filePath.split('.').pop();
      const fileStream = fs.createReadStream(filePath);
      // const fileKey = `${Date.now()}.${extension}`;
      const fileKey = `${ENV.env}/${folder}/${Date.now()}.${extension}`; // Move the path to Key

      const command = new PutObjectCommand({
        Bucket: `${ENV.s3.bucket}`,
        Key: fileKey,
        Body: fileStream,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3.send(command);
      const fileUrl = `https://${ENV.s3.endpoint}/${ENV.s3.bucket}/${fileKey}`;

      try {
        fs.unlinkSync(join(process.cwd(), filePath));
      } catch (error) {
        console.error('🚀 ~ UploadService ~ uploadToSpace ~ error:', error);
      }

      return fileUrl;
    } catch (error) {
      console.error('🚀 ~ UploadService ~ uploadToSpace ~ error:', error);
      return null;
    }
  }

  async deleteFromSpace(key: string): Promise<void> {
    const params = {
      Bucket: ENV.s3.bucket,
      Key: key,
    };
    const command = new DeleteObjectCommand(params);
    const send = await this.s3.send(command);
  }
}
