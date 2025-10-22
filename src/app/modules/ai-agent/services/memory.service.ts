import { Injectable, Logger } from '@nestjs/common';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationHistory {
  userId: string;
  sessionId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private conversations: Map<string, ConversationHistory> = new Map();
  private maxMessagesPerSession = 20;

  getHistory(userId: string, sessionId: string): Message[] {
    const key = `${userId}:${sessionId}`;
    const conversation = this.conversations.get(key);
    return conversation ? conversation.messages : [];
  }

  addMessage(userId: string, sessionId: string, role: 'user' | 'assistant', content: string) {
    const key = `${userId}:${sessionId}`;
    let conversation = this.conversations.get(key);

    if (!conversation) {
      conversation = {
        userId,
        sessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const message: Message = { role, content };
    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    if (conversation.messages.length > this.maxMessagesPerSession) {
      conversation.messages = conversation.messages.slice(-this.maxMessagesPerSession);
    }

    this.conversations.set(key, conversation);
    this.logger.log(`💬 Added ${role} message to ${key}`);
  }

  clearHistory(userId: string, sessionId: string): boolean {
    const key = `${userId}:${sessionId}`;
    const deleted = this.conversations.delete(key);
    if (deleted) {
      this.logger.log(`🗑️ Cleared history for ${key}`);
    }
    return deleted;
  }

  getUserSessions(userId: string): string[] {
    const sessions: string[] = [];
    this.conversations.forEach((conversation) => {
      if (conversation.userId === userId) {
        sessions.push(conversation.sessionId);
      }
    });
    return sessions;
  }

  getSummary(userId: string, sessionId: string): string {
    const history = this.getHistory(userId, sessionId);
    if (history.length === 0) return 'No conversation history';

    const userMessages = history.filter((m) => m.role === 'user').length;
    const aiMessages = history.filter((m) => m.role === 'assistant').length;

    return `Total messages: ${history.length} (User: ${userMessages}, AI: ${aiMessages})`;
  }
}
