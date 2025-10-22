import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { storageFileOptions, storageImageOptions } from '@src/shared';
import { execSync } from 'child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Logger } from 'winston';
import { UploadService } from '../services/upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UsePipes(new ValidationPipe())
@Controller('upload')
export class UploadController {
  constructor(private readonly fileUploadService: UploadService) { }
  private imageBasePublicPath = ENV.UPLOAD_BASE_PUBLIC_PATH;
  private readonly allowedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

  //! UploadImages
  @Post('upload-images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('image', 2, { storage: storageImageOptions }))
  uploadImages(@UploadedFiles() files: IFileMeta[]): Promise<SuccessResponse> {
    return this.fileUploadService.uploadImage(files);
  }

  //! UploadFile
  @Post('upload-files')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('file', 2, {
      storage: storageFileOptions,
    }),
  )
  uploadFiles(@Req() req, @UploadedFiles() files: IFileMeta[]): Promise<SuccessResponse> {
    return this.fileUploadService.uploadImage(files);
  }

  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF file',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })

  @Post('convert-to-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async convertToPdf(
    @UploadedFile() file: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // eslint-disable-next-line no-console
    console.log('FILE:=>', file);
    const fileExt = this.getFileExtension(file.originalname);
    if (!this.isValidFileType(file.mimetype, fileExt)) {
      throw new BadRequestException('Unsupported file type for conversion');
    }
    const allowedMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type for conversion');
    }

    const tempDir = join(tmpdir(), 'libre-conversion', `conv-${Date.now()}`);
    const originalName = file.originalname.replace(/\s+/g, '_'); // Sanitize filename
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove existing extension
    const tempInput = join(tempDir, `input_${Date.now()}_${originalName}`);
    const tempOutput = join(tempDir, `output_${Date.now()}_${this.getBaseName(originalName)}.pdf`);

    try {
      // Ensure temp directory exists
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, {
          recursive: true,
          mode: 0o755, // Read/write for owner, read for others
        });
      }
      // Write input file
      writeFileSync(tempInput, file.buffer);

      // Build conversion command
      const command = [
        'libreoffice',
        '--headless',
        '--nologo',
        '--nofirststartwizard',
        '--convert-to',
        'pdf',
        `--outdir`,
        tempDir,
        tempInput,
      ].join(' ');

      let attempt = 0;
      const maxAttempts = 3;
      let success = false;

      while (attempt < maxAttempts && !success) {
        try {
          attempt++;
          const result = execSync(command, {
            timeout: 30000,
            stdio: ['ignore', 'pipe', 'pipe'], // Capture stderr
            encoding: 'utf-8',
          });
          success = true;
        } catch (error) {
          new Logger().log(`Conversion attempt ${attempt} failed: `, error);
          if (attempt === maxAttempts) {
            throw new InternalServerErrorException(
              `Conversion failed after ${maxAttempts} attempts: ${error.stderr?.toString()}`,
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Verify output file exists
      if (!existsSync(tempOutput)) {
        throw new InternalServerErrorException(
          'PDF output file not generated. Possible reasons:\n' +
          '1. LibreOffice not installed correctly\n' +
          '2. Insufficient file permissions\n' +
          '3. Unsupported file format',
        );
      }

      // Read and return PDF
      const pdfData = readFileSync(tempOutput);
      return new StreamableFile(pdfData, { type: 'application/pdf' });
    } finally {
      // Cleanup files
      this.cleanupFiles([tempInput, tempOutput]);
    }
  }

  private isValidFileType(mimetype: string, extension: string): boolean {
    const validMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    return (
      validMimeTypes.some((mt) => mimetype.startsWith(mt)) &&
      this.allowedExtensions.includes(extension.toLowerCase())
    );
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop().toLowerCase();
  }

  private getBaseName(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
  }

  private cleanupFiles(paths: string[]): void {
    paths.forEach((path) => {
      try {
        if (existsSync(path)) {
          if (lstatSync(path).isDirectory()) {
            rmdirSync(path, { recursive: true });
          } else {
            unlinkSync(path);
          }
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
  }
}