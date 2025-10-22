import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class ChatResponseDto {
  response: string;
  sessionId: string;
  contextUsed?: boolean;
  timestamp: Date;
}

export class AddContextDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}

export class BulkContextDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContextItemDto)
  contexts: ContextItemDto[];
}

export class ContextItemDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  metadata?: any;
}
