import { Injectable, Logger } from '@nestjs/common';
import { ENV } from '@src/env';
import { Ollama } from 'ollama';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private ollama: Ollama;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.llama.baseUrl || 'http://localhost:11434';
    this.ollama = new Ollama({
      host: this.baseUrl,
    });
    this.model = ENV.llama.model || 'llama2';
    this.logger.log('✅ LLM Service initialized');
  }

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: messages,
      });

      return response.message.content;
    } catch (error) {
      this.logger.error('❌ LLM generation failed', error);
      throw error;
    }
  }

  async chat(systemContext: string, userMessage: string, history: Message[] = []): Promise<string> {
    const messages: Message[] = [
      { role: 'system', content: systemContext },
      ...history,
      { role: 'user', content: userMessage },
    ];

    return this.generateResponse(messages);
  }

  async *streamResponse(messages: Message[]) {
    try {
      const stream = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        yield chunk.message.content;
      }
    } catch (error) {
      this.logger.error('❌ LLM streaming failed', error);
      throw error;
    }
  }

  // async generateEmbedding(text: string): Promise<number[]> {
  //   const embedding = new Array(384).fill(0).map(() => Math.random() - 0.5);

  //   for (let i = 0; i < text.length && i < 384; i++) {
  //     embedding[i] = text.charCodeAt(i) / 255 - 0.5;
  //   }

  //   return embedding;
  // }

  // async generateEmbedding(text: string): Promise<number[]> {
  //   try {
  //     // Try to use Ollama's embeddings API
  //     const response = await fetch(`${this.baseUrl}/api/embeddings`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         model: 'nomic-embed-text',
  //         prompt: text,
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.embedding) {
  //         return data.embedding; // Return full 768 dimensions
  //       }
  //     }

  //     // Fallback to simple embedding
  //     this.logger.warn('⚠️ Using simple embedding fallback');
  //     return this.simpleEmbedding(text);
  //   } catch (error) {
  //     this.logger.warn('⚠️ Embedding API failed, using simple fallback');
  //     return this.simpleEmbedding(text);
  //   }
  // }

  // private simpleEmbedding(text: string): number[] {
  //   // Create 768-dimensional embedding to match nomic-embed-text
  //   const embedding = new Array(768).fill(0);
  //   const words = text.toLowerCase().split(/\s+/);

  //   words.forEach((word, idx) => {
  //     const hash = this.hashString(word);
  //     const position = Math.abs(hash) % 768;
  //     embedding[position] += 1 / (idx + 1);
  //   });

  //   const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  //   return embedding.map((val) => val / (magnitude || 1));
  // }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Ollama's native embedding method
      const response = await this.ollama.embeddings({
        model: ENV.llama.embeddingModel || 'nomic-embed-text',
        prompt: text,
      });

      if (response.embedding && Array.isArray(response.embedding)) {
        this.logger.debug(`✅ Generated embedding of size ${response.embedding.length}`);
        return response.embedding;
      }

      throw new Error('No embedding returned from Ollama');
    } catch (error) {
      this.logger.warn(`⚠️ Ollama embedding failed: ${error.message}, using fallback`);
      return this.simpleBetterEmbedding(text);
    }
  }

  private simpleBetterEmbedding(text: string): number[] {
    // Better fallback embedding using TF-IDF-like approach
    const embedding = new Array(768).fill(0);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Only words > 2 chars

    // Use word position and frequency
    const wordFreq = new Map<string, number>();
    words.forEach((word) => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Create embedding based on unique words
    Array.from(wordFreq.entries()).forEach(([word, freq], idx) => {
      const hash = this.hashString(word);
      const position = Math.abs(hash) % 768;
      // Weight by inverse frequency (TF-IDF style)
      embedding[position] += Math.log(1 + freq) / Math.log(words.length + 1);
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalized = embedding.map((val) => val / (magnitude || 1));

    return normalized;
  }
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }
}
