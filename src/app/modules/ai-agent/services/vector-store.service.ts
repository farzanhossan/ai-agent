import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ENV } from '@src/env';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private client: QdrantClient;

  // Two separate collections
  // private knowledgeCollection = 'ai_agent_knowledge'; // Your trained data
  private knowledgeCollection = 'ai_agent_knowledge_dynamic'; // Your trained data
  private conversationCollection = 'ai_agent_conversations'; // User chat history

  constructor() {}

  async onModuleInit() {
    try {
      this.client = new QdrantClient({
        url: ENV.qdrant.url || 'http://localhost:6333',
      });

      await this.ensureCollection(this.knowledgeCollection);
      await this.ensureCollection(this.conversationCollection);

      this.logger.log('✅ VectorStore initialized with 2 collections');
    } catch (error) {
      this.logger.error('❌ VectorStore initialization failed', error);
    }
  }

  private async ensureCollection(collectionName: string) {
    try {
      await this.client.getCollection(collectionName);
      this.logger.log(`Collection "${collectionName}" already exists`);
    } catch (error) {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: 768, // nomic-embed-text dimension
          distance: 'Cosine',
        },
      });
      this.logger.log(`✅ Created collection: ${collectionName}`);
    }
  }

  // ========== KNOWLEDGE BASE METHODS ==========

  async storeKnowledge(id: string, text: string, embedding: number[], metadata: any = {}) {
    try {
      await this.client.upsert(this.knowledgeCollection, {
        points: [
          {
            id,
            vector: embedding,
            payload: {
              text,
              ...metadata,
              type: 'knowledge',
              createdAt: new Date().toISOString(),
            },
          },
        ],
      });
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to store knowledge', error);
      return false;
    }
  }

  async searchKnowledge(embedding: number[], limit: number = 5) {
    try {
      const results = await this.client.search(this.knowledgeCollection, {
        vector: embedding,
        limit,
        with_payload: true,
        score_threshold: 0.5, // Only return results with >50% similarity
      });

      this.logger.log(
        `🔍 Found ${results.length} knowledge items (scores: ${results.map((r) => r.score.toFixed(2)).join(', ')})`,
      );
      return results;
    } catch (error) {
      this.logger.error('❌ Knowledge search failed', error);
      return [];
    }
  }

  async getAllKnowledge(limit: number = 100) {
    try {
      const results = await this.client.scroll(this.knowledgeCollection, {
        limit,
        with_payload: true,
        with_vector: false,
      });
      return results.points;
    } catch (error) {
      this.logger.error('❌ Failed to get knowledge', error);
      return [];
    }
  }

  async clearKnowledge() {
    try {
      await this.client.deleteCollection(this.knowledgeCollection);
      await this.ensureCollection(this.knowledgeCollection);
      this.logger.log('🗑️ Cleared knowledge base');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to clear knowledge', error);
      return false;
    }
  }

  // ========== CONVERSATION HISTORY METHODS ==========

  async storeConversation(id: string, text: string, embedding: number[], metadata: any = {}) {
    try {
      await this.client.upsert(this.conversationCollection, {
        points: [
          {
            id,
            vector: embedding,
            payload: {
              text,
              ...metadata,
              type: 'conversation',
              createdAt: new Date().toISOString(),
            },
          },
        ],
      });
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to store conversation', error);
      return false;
    }
  }

  async searchConversations(embedding: number[], userId: string, limit: number = 3) {
    try {
      const results = await this.client.search(this.conversationCollection, {
        vector: embedding,
        limit,
        with_payload: true,
        filter: {
          must: [
            {
              key: 'userId',
              match: { value: userId },
            },
          ],
        },
      });

      this.logger.log(`💬 Found ${results.length} past conversations for user ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('❌ Conversation search failed', error);
      return [];
    }
  }

  async clearUserConversations(userId: string) {
    try {
      // Delete all conversations for a specific user
      await this.client.delete(this.conversationCollection, {
        filter: {
          must: [
            {
              key: 'userId',
              match: { value: userId },
            },
          ],
        },
      });
      this.logger.log(`🗑️ Cleared conversations for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to clear user conversations', error);
      return false;
    }
  }

  // ========== LEGACY METHODS (for backward compatibility) ==========

  async storeContext(id: string, text: string, embedding: number[], metadata: any = {}) {
    // Default to knowledge base
    return this.storeKnowledge(id, text, embedding, metadata);
  }

  async searchSimilar(embedding: number[], limit: number = 5) {
    // Default to knowledge base
    return this.searchKnowledge(embedding, limit);
  }

  async getAllContexts(limit: number = 100) {
    return this.getAllKnowledge(limit);
  }

  async clearAll() {
    await this.clearKnowledge();
    return true;
  }
}
