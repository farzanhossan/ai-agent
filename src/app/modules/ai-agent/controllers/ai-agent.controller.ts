import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiAgentService } from '../services/ai-agent.service';
import { ChatRequestDto, ChatResponseDto, AddContextDto } from '../dtos/chat.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';

@ApiTags('Ai Agent')
@ApiBearerAuth()
@Controller('ai-agent')
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  // /**
  //  * Knowledge base from JSON
  //  * POST /ai-agent/train-context
  //  */
  // @Public()
  // @Post('train-context')
  // @HttpCode(HttpStatus.OK)
  // async trainContext() {
  //   await this.contextLoaderService.reloadKnowledgeBase();
  //   return {
  //     success: true,
  //     message: 'Knowledge base reloaded successfully',
  //   };
  // }

  /**
   * Simple chat endpoint
   * POST /ai-agent/chat/simple
   */
  @Public()
  @Post('chat/simple')
  @HttpCode(HttpStatus.OK)
  async simpleChat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const result = await this.aiAgentService.simpleChat(
      chatRequest.userId,
      chatRequest.message,
      chatRequest.sessionId,
    );

    return result;
  }

  /**
   * Smart chat endpoint (with RAG)
   * POST /ai-agent/chat/smart
   */
  @Public()
  @Post('chat/smart')
  @HttpCode(HttpStatus.OK)
  async smartChat(@Body() chatRequest: ChatRequestDto) {
    const result = await this.aiAgentService.smartChat(
      chatRequest.userId,
      chatRequest.message,
      chatRequest.sessionId,
    );

    return result;
  }

  /**
   * Add context to knowledge base
   * POST /ai-agent/context
   */
  @Public()
  @Post('context')
  @HttpCode(HttpStatus.CREATED)
  async addContext(@Body() contextDto: AddContextDto) {
    const result = await this.aiAgentService.addContext(
      contextDto.content,
      contextDto.category,
      contextDto.metadata ? JSON.parse(contextDto.metadata) : undefined,
    );

    return result;
  }

  /**
   * Add multiple contexts
   * POST /ai-agent/context/bulk
   */
  @Public()
  @Post('context/bulk')
  @HttpCode(HttpStatus.CREATED)
  async addMultipleContexts(
    @Body() body: { contexts: Array<{ content: string; category?: string; metadata?: any }> },
  ) {
    const result = await this.aiAgentService.addMultipleContexts(body.contexts);
    return result;
  }

  /**
   * Search in knowledge base
   * GET /ai-agent/context/search?query=xxx&limit=5
   */
  @Public()
  @Get('context/search')
  async searchContext(@Query('query') query: string, @Query('limit') limit?: number) {
    const result = await this.aiAgentService.searchContext(
      query,
      limit ? parseInt(limit.toString()) : 5,
    );
    return result;
  }

  /**
   * Get all contexts
   * GET /ai-agent/context?limit=100
   */
  @Public()
  @Get('context')
  async getAllContexts(@Query('limit') limit?: number) {
    const result = await this.aiAgentService.getAllContexts(
      limit ? parseInt(limit.toString()) : 100,
    );
    return result;
  }

  /**
   * Clear conversation history
   * DELETE /ai-agent/history/:userId/:sessionId
   */
  @Public()
  @Delete('history/:userId/:sessionId')
  @HttpCode(HttpStatus.OK)
  async clearHistory(@Param('userId') userId: string, @Param('sessionId') sessionId: string) {
    const result = await this.aiAgentService.clearHistory(userId, sessionId);
    return result;
  }

  /**
   * Get user sessions
   * GET /ai-agent/sessions/:userId
   */
  @Public()
  @Get('sessions/:userId')
  async getUserSessions(@Param('userId') userId: string) {
    const result = await this.aiAgentService.getUserSessions(userId);
    return result;
  }

  /**
   * Get conversation summary
   * GET /ai-agent/summary/:userId/:sessionId
   */
  @Public()
  @Get('summary/:userId/:sessionId')
  async getConversationSummary(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.aiAgentService.getConversationSummary(userId, sessionId);
    return result;
  }

  /**
   * Clear all contexts (knowledge base)
   * DELETE /ai-agent/context/all
   */
  @Public()
  @Delete('context/all')
  @HttpCode(HttpStatus.OK)
  async clearAllContexts() {
    const result = await this.aiAgentService.clearAllContexts();
    return result;
  }

  /**
   * Health check
   * GET /ai-agent/health
   */
  @Public()
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date(),
      service: 'AI Agent',
    };
  }
}
