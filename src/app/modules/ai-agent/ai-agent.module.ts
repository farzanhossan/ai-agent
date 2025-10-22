import { Module } from '@nestjs/common';
import { AiAgentController } from './controllers/ai-agent.controller';
import { AiAgentService } from './services/ai-agent.service';
import { LlmService } from './services/llm.service';
import { MemoryService } from './services/memory.service';
import { VectorStoreService } from './services/vector-store.service';
import { ContextLoaderService } from './services/knowledge/context-loader.service';
import { ContentProcessorService } from './services/knowledge/content-processor.service';
import { DynamicContextIngestionService } from './services/knowledge/dynamic-ingestion.service';
import { HybridCategorizerService } from './services/knowledge/hybrid-categorizer.service';
import { LlmCategorizerService } from './services/knowledge/llm-categorizer.service';
import { RuleBasedCategorizerService } from './services/knowledge/role-based-categorizer.service';
import { KnowledgeController } from './controllers/knowledge.controller';

@Module({
  imports: [],
  controllers: [AiAgentController, KnowledgeController],
  providers: [
    // Core services
    LlmService,
    VectorStoreService,
    MemoryService,
    AiAgentService,

    // Categorization services
    RuleBasedCategorizerService,
    LlmCategorizerService,
    HybridCategorizerService,

    // Content processing
    ContentProcessorService,
    DynamicContextIngestionService,

    // Context loading
    ContextLoaderService,
  ],
  exports: [
    AiAgentService,
    DynamicContextIngestionService,
    ContextLoaderService,
    HybridCategorizerService,
  ],
})
export class AiAgentModule {}
