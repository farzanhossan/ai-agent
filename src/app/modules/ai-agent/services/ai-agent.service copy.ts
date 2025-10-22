import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { MemoryService } from './memory.service';
import { v4 as uuidv4 } from 'uuid';
import { detectLanguage } from '../utils/language-detector';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);

  // Default system context
  private readonly defaultSystemContext = `You are a helpful AI assistant.
You are friendly, professional, and knowledgeable.
Always provide accurate and helpful responses.
If you don't know something, admit it honestly.`;

  constructor(
    private vectorStore: VectorStoreService,
    private llmService: LlmService,
    private memoryService: MemoryService,
  ) {
    this.logger.log('✅ AI Agent Service initialized');
  }

  /**
   * Simple chat - Basic conversation without context retrieval
   */
  async simpleChat(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      // Generate or use existing session ID
      const session = sessionId || uuidv4();

      // Get conversation history
      const history = this.memoryService.getHistory(userId, session);

      // Generate response
      const response = await this.llmService.chat(this.defaultSystemContext, message, history);

      // Save to memory
      this.memoryService.addMessage(userId, session, 'user', message);
      this.memoryService.addMessage(userId, session, 'assistant', response);

      this.logger.log(`💬 Simple chat: ${userId} - ${session}`);

      return {
        response,
        sessionId: session,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Simple chat failed', error);
      throw error;
    }
  }

  /**
   * Smart chat - With context retrieval from Vector DB
   */
  //   async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
  //     try {
  //       // Generate or use existing session ID
  //       const session = sessionId || uuidv4();

  //       // 1. Generate embedding for user message
  //       const messageEmbedding = await this.llmService.generateEmbedding(message);

  //       // 2. Search for similar context in Vector DB
  //       const similarContexts = await this.vectorStore.searchSimilar(messageEmbedding, 3);

  //       // 3. Build context from retrieved documents
  //       const retrievedContext = similarContexts
  //         .map((ctx, index) => `[Context ${index + 1}]: ${ctx.payload?.text}`)
  //         .join('\n');

  //       // 4. Get conversation history
  //       const history = this.memoryService.getHistory(userId, session);

  //       // 5. Build enhanced system context
  //       const enhancedContext = `${this.defaultSystemContext}

  // ${retrievedContext ? `RELEVANT CONTEXT:\n${retrievedContext}\n` : ''}

  // Use the above context if relevant to answer the user's question.
  // If the context doesn't help, answer based on your knowledge.`;

  //       // 6. Generate response with context
  //       const response = await this.llmService.chat(enhancedContext, message, history);

  //       // 7. Save conversation to memory
  //       this.memoryService.addMessage(userId, session, 'user', message);
  //       this.memoryService.addMessage(userId, session, 'assistant', response);

  //       // 8. Store this conversation in Vector DB for future use
  //       await this.vectorStore.storeContext(
  //         uuidv4(),
  //         `Q: ${message}\nA: ${response}`,
  //         messageEmbedding,
  //         {
  //           userId,
  //           sessionId: session,
  //           type: 'conversation',
  //         },
  //       );

  //       this.logger.log(`🧠 Smart chat: ${userId} - ${session}`);

  //       return {
  //         response,
  //         sessionId: session,
  //         contextUsed: similarContexts.length > 0,
  //         timestamp: new Date(),
  //       };
  //     } catch (error) {
  //       this.logger.error('❌ Smart chat failed', error);
  //       throw error;
  //     }
  //   }
  //   async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
  //     try {
  //       const session = sessionId || uuidv4();

  //       // 1. Generate embedding for user message
  //       const messageEmbedding = await this.llmService.generateEmbedding(message);

  //       // 2. Search for similar context in Vector DB
  //       const similarContexts = await this.vectorStore.searchSimilar(messageEmbedding, 5); // Increase to 5

  //       // 3. Build context from retrieved documents
  //       const retrievedContext = similarContexts
  //         .filter((ctx) => ctx.score > 0.3) // Only use if similarity is good
  //         .map((ctx, index) => {
  //           return `[Source ${index + 1}]:\n${ctx.payload?.text}\n`;
  //         })
  //         .join('\n');

  //       // 4. Get conversation history
  //       const history = this.memoryService.getHistory(userId, session);

  //       // 5. Build BETTER system context
  //       const enhancedContext = `You are a helpful AI assistant for an online learning platform.

  // ${
  //   retrievedContext
  //     ? `IMPORTANT - USE THIS CONTEXT TO ANSWER:
  // ${retrievedContext}

  // INSTRUCTIONS:
  // - You MUST use the information provided in the context above to answer the user's question
  // - If the context contains relevant information, base your answer on it
  // - Be specific and reference the courses, policies, or information from the context
  // - If the context doesn't contain relevant information, say so clearly
  // - Do not make up information that isn't in the context
  // `
  //     : "No relevant context found. Answer based on general knowledge but mention that you don't have specific information about this topic."
  // }`;

  //       // 6. Generate response with context
  //       const response = await this.llmService.chat(enhancedContext, message, history);

  //       // 7. Save conversation to memory
  //       this.memoryService.addMessage(userId, session, 'user', message);
  //       this.memoryService.addMessage(userId, session, 'assistant', response);

  //       // 8. Store this conversation in Vector DB for future use
  //       await this.vectorStore.storeContext(
  //         uuidv4(),
  //         `Q: ${message}\nA: ${response}`,
  //         messageEmbedding,
  //         {
  //           userId,
  //           sessionId: session,
  //           type: 'conversation',
  //         },
  //       );

  //       this.logger.log(
  //         `🧠 Smart chat: ${userId} - Found ${similarContexts.length} similar contexts`,
  //       );

  //       return {
  //         response,
  //         sessionId: session,
  //         contextUsed: similarContexts.length > 0,
  //         contextsFound: similarContexts.length,
  //         contextScores: similarContexts.map((c) => c.score),
  //         timestamp: new Date(),
  //       };
  //     } catch (error) {
  //       this.logger.error('❌ Smart chat failed', error);
  //       throw error;
  //     }
  //   }

  //   async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
  //     try {
  //       const session = sessionId || uuidv4();

  //       // 1. Generate embedding for user message
  //       const messageEmbedding = await this.llmService.generateEmbedding(message);

  //       // 2. Search KNOWLEDGE BASE (your trained data)
  //       const knowledgeResults = await this.vectorStore.searchKnowledge(messageEmbedding, 5);

  //       // 3. Search USER'S PAST CONVERSATIONS (for context about user)
  //       const pastConversations = await this.vectorStore.searchConversations(
  //         messageEmbedding,
  //         userId,
  //         2,
  //       );

  //       // 4. Build knowledge context
  //       const knowledgeContext = knowledgeResults
  //         .filter((ctx) => ctx.score > 0.5)
  //         .map((ctx, index) => `[Knowledge ${index + 1}]:\n${ctx.payload?.text}`)
  //         .join('\n\n');

  //       // 5. Build conversation context
  //       const conversationContext = pastConversations
  //         .map((ctx, index) => `[Past conversation ${index + 1}]:\n${ctx.payload?.text}`)
  //         .join('\n\n');

  //       // 6. Get current session history
  //       const history = this.memoryService.getHistory(userId, session);

  //       // 7. Build ENHANCED system prompt
  //       const enhancedContext = `You are a helpful AI assistant for an international education platform.

  // ${
  //   knowledgeContext
  //     ? `KNOWLEDGE BASE (Use this to answer accurately):
  // ${knowledgeContext}

  // `
  //     : ''
  // }${
  //         conversationContext
  //           ? `USER'S PAST CONVERSATIONS (For understanding user context):
  // ${conversationContext}

  // `
  //           : ''
  //       }CRITICAL INSTRUCTIONS:
  // - You MUST use the KNOWLEDGE BASE information above to answer the user's question
  // - The knowledge contains details about universities, courses, visa requirements, and assessments
  // - Be specific and cite the information from the knowledge base
  // - If the knowledge base has relevant information, use it to provide accurate details
  // - If no relevant information in knowledge base, clearly state that
  // - Use past conversations to understand user preferences but prioritize knowledge base for facts`;

  //       // 8. Generate response
  //       const response = await this.llmService.chat(enhancedContext, message, history);

  //       // 9. Save to in-memory conversation history
  //       this.memoryService.addMessage(userId, session, 'user', message);
  //       this.memoryService.addMessage(userId, session, 'assistant', response);

  //       // 10. Store this conversation in CONVERSATION collection (not knowledge base!)
  //       await this.vectorStore.storeConversation(
  //         uuidv4(),
  //         `User: ${message}\nAssistant: ${response}`,
  //         messageEmbedding,
  //         {
  //           userId,
  //           sessionId: session,
  //           timestamp: Date.now(),
  //         },
  //       );

  //       this.logger.log(
  //         `🧠 Smart chat: Found ${knowledgeResults.length} knowledge items, ${pastConversations.length} past conversations`,
  //       );

  //       return {
  //         response,
  //         sessionId: session,
  //         knowledgeUsed: knowledgeResults.length > 0,
  //         knowledgeCount: knowledgeResults.length,
  //         conversationContext: pastConversations.length,
  //         knowledgeScores: knowledgeResults.map((c) => c.score),
  //         timestamp: new Date(),
  //       };
  //     } catch (error) {
  //       this.logger.error('❌ Smart chat failed', error);
  //       throw error;
  //     }
  //   }

  //   async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
  //     try {
  //       const session = sessionId || uuidv4();

  //       // 1. Generate embedding
  //       const messageEmbedding = await this.llmService.generateEmbedding(message);

  //       // 2. Search knowledge base
  //       const knowledgeResults = await this.vectorStore.searchKnowledge(messageEmbedding, 10);

  //       // Log what we found
  //       this.logger.log(`🔍 Search for: "${message}"`);
  //       this.logger.log(`📊 Found ${knowledgeResults.length} knowledge items`);
  //       knowledgeResults.forEach((r: any, i) => {
  //         this.logger.log(
  //           `  ${i + 1}. Score: ${r.score.toFixed(3)} | ${r.payload?.text?.substring(0, 100)}...`,
  //         );
  //       });

  //       // 3. Search past conversations
  //       const pastConversations = await this.vectorStore.searchConversations(
  //         messageEmbedding,
  //         userId,
  //         2,
  //       );

  //       // 4. Get session history
  //       const history = this.memoryService.getHistory(userId, session);

  //       // 5. Build knowledge context with HIGH quality matches only
  //       const goodMatches = knowledgeResults.filter((ctx) => ctx.score > 0.6);

  //       const knowledgeContext =
  //         goodMatches.length > 0
  //           ? goodMatches
  //               .slice(0, 8) // Top 8 matches
  //               .map((ctx, index) => {
  //                 const category: any = ctx.payload?.category || 'info';
  //                 const text = ctx.payload?.text || '';
  //                 return `[${category.toUpperCase()} - Relevance: ${(ctx.score * 100).toFixed(0)}%]\n${text}`;
  //               })
  //               .join('\n\n')
  //           : null;

  //       // 6. Build conversation context
  //       const conversationContext =
  //         pastConversations.length > 0
  //           ? pastConversations
  //               .map((ctx, index) => `Previous conversation:\n${ctx.payload?.text}`)
  //               .join('\n\n')
  //           : null;

  //       // 7. ENHANCED SYSTEM PROMPT
  //       const systemPrompt = `You are an expert education consultant AI assistant specializing in international university admissions and study abroad programs.

  // ${
  //   knowledgeContext
  //     ? `=== KNOWLEDGE BASE (Your primary source of truth) ===
  // ${knowledgeContext}

  // === END OF KNOWLEDGE BASE ===

  // `
  //     : ''
  // }${
  //         conversationContext
  //           ? `=== USER'S PREVIOUS CONVERSATIONS ===
  // ${conversationContext}

  // `
  //           : ''
  //       }=== INSTRUCTIONS ===
  // 1. **USE THE KNOWLEDGE BASE ABOVE** - This contains verified information about universities, courses, visa requirements, and assessments
  // 2. **Be specific and accurate** - Reference actual university names, course details, and requirements from the knowledge base
  // 3. **If information exists in knowledge base** - Use it! Don't say you don't know
  // 4. **If no relevant info in knowledge base** - Then clearly state that you don't have that specific information
  // 5. **HSC Result context** - If user mentions HSC results (like 3.42), understand they're asking which universities accept students with that score
  // 6. **Be helpful** - Suggest alternatives and ask clarifying questions when needed
  // 7. **Format responses clearly** - Use bullet points for lists, be conversational but professional

  // ${!knowledgeContext ? '⚠️ WARNING: No relevant information found in knowledge base for this query. Respond accordingly.' : '✅ Knowledge base information provided above - USE IT!'}`;

  //       // 8. Generate response
  //       const response = await this.llmService.chat(systemPrompt, message, history);

  //       // 9. Save to memory
  //       this.memoryService.addMessage(userId, session, 'user', message);
  //       this.memoryService.addMessage(userId, session, 'assistant', response);

  //       // 10. Store conversation
  //       await this.vectorStore.storeConversation(
  //         uuidv4(),
  //         `User: ${message}\nAssistant: ${response}`,
  //         messageEmbedding,
  //         { userId, sessionId: session, timestamp: Date.now() },
  //       );

  //       const result = {
  //         response,
  //         sessionId: session,
  //         knowledgeUsed: goodMatches.length > 0,
  //         knowledgeCount: goodMatches.length,
  //         totalSearchResults: knowledgeResults.length,
  //         conversationContext: pastConversations.length,
  //         bestScore: knowledgeResults[0]?.score || 0,
  //         knowledgeScores: goodMatches.map((c) => c.score),
  //         timestamp: new Date(),
  //       };

  //       this.logger.log(`✅ Response generated using ${goodMatches.length} knowledge items`);

  //       return result;
  //     } catch (error) {
  //       this.logger.error('❌ Smart chat failed', error);
  //       throw error;
  //     }
  //   }

  //   async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
  //     try {
  //       const session = sessionId || uuidv4();

  //       // 1. Generate embedding
  //       const messageEmbedding = await this.llmService.generateEmbedding(message);

  //       // 2. Search knowledge base
  //       const knowledgeResults = await this.vectorStore.searchKnowledge(messageEmbedding, 10);

  //       // Log what we found
  //       this.logger.log(`🔍 Search for: "${message}"`);
  //       this.logger.log(`📊 Found ${knowledgeResults.length} knowledge items`);
  //       knowledgeResults.forEach((r: any, i) => {
  //         this.logger.log(
  //           `  ${i + 1}. Score: ${r.score.toFixed(3)} | ${r.payload?.text?.substring(0, 100)}...`,
  //         );
  //       });

  //       // 3. Search past conversations
  //       const pastConversations = await this.vectorStore.searchConversations(
  //         messageEmbedding,
  //         userId,
  //         2,
  //       );

  //       // 4. Get session history
  //       const history = this.memoryService.getHistory(userId, session);

  //       // 5. Build knowledge context with HIGH quality matches only
  //       const goodMatches = knowledgeResults.filter((ctx) => ctx.score > 0.6);

  //       const knowledgeContext =
  //         goodMatches.length > 0
  //           ? goodMatches
  //               .slice(0, 5) // Reduced from 8 to 5
  //               .map((ctx, index) => {
  //                 const category: any = ctx.payload?.category || 'info';
  //                 const text = ctx.payload?.text || '';
  //                 return `[${category.toUpperCase()}]\n${text}`;
  //               })
  //               .join('\n\n')
  //           : null;

  //       // 6. Build conversation context
  //       const conversationContext =
  //         pastConversations.length > 0
  //           ? pastConversations.map((ctx, index) => `${ctx.payload?.text}`).join('\n')
  //           : null;

  //       // 7. OPTIMIZED SYSTEM PROMPT FOR CONCISE RESPONSES
  //       const systemPrompt = `You are a professional education consultant AI for international university admissions.

  // ${
  //   knowledgeContext
  //     ? `KNOWLEDGE BASE:
  // ${knowledgeContext}
  // `
  //     : ''
  // }${
  //         conversationContext
  //           ? `CONTEXT:
  // ${conversationContext}
  // `
  //           : ''
  //       }INSTRUCTIONS:
  // - Be direct and concise - maximum 3-4 sentences unless listing universities
  // - Use knowledge base facts only
  // - For HSC scores: list 3-5 relevant universities with brief requirements
  // - Format: University name, location, key requirement
  // - Avoid lengthy explanations, get to the point quickly
  // - If no info available, say so in one sentence
  // - Don't repeat instructions or ask unnecessary questions

  // ${!knowledgeContext ? 'No knowledge base match - respond briefly.' : 'Use knowledge base above.'}`;

  //       // 8. Generate response
  //       const response = await this.llmService.chat(systemPrompt, message, history);

  //       // 9. Save to memory
  //       this.memoryService.addMessage(userId, session, 'user', message);
  //       this.memoryService.addMessage(userId, session, 'assistant', response);

  //       // 10. Store conversation
  //       await this.vectorStore.storeConversation(
  //         uuidv4(),
  //         `User: ${message}\nAssistant: ${response}`,
  //         messageEmbedding,
  //         { userId, sessionId: session, timestamp: Date.now() },
  //       );

  //       const result = {
  //         response,
  //         sessionId: session,
  //         knowledgeUsed: goodMatches.length > 0,
  //         knowledgeCount: goodMatches.length,
  //         totalSearchResults: knowledgeResults.length,
  //         conversationContext: pastConversations.length,
  //         bestScore: knowledgeResults[0]?.score || 0,
  //         knowledgeScores: goodMatches.map((c) => c.score),
  //         timestamp: new Date(),
  //       };

  //       this.logger.log(`✅ Response generated using ${goodMatches.length} knowledge items`);

  //       return result;
  //     } catch (error) {
  //       this.logger.error('❌ Smart chat failed', error);
  //       throw error;
  //     }
  //   }

  async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      const session = sessionId || uuidv4();

      // 1. Detect language
      const language = detectLanguage(message);
      this.logger.log(`🌐 Detected language: ${language}`);

      // 2. Generate embedding
      const messageEmbedding = await this.llmService.generateEmbedding(message);

      // 3. Search knowledge base
      const knowledgeResults = await this.vectorStore.searchKnowledge(messageEmbedding, 10);

      // Log what we found
      this.logger.log(`🔍 Search for: "${message}"`);
      this.logger.log(`📊 Found ${knowledgeResults.length} knowledge items`);
      knowledgeResults.forEach((r: any, i) => {
        this.logger.log(
          `  ${i + 1}. Score: ${r.score.toFixed(3)} | ${r.payload?.text?.substring(0, 100)}...`,
        );
      });

      // 4. Search past conversations
      const pastConversations = await this.vectorStore.searchConversations(
        messageEmbedding,
        userId,
        2,
      );

      // 5. Get session history
      const history = this.memoryService.getHistory(userId, session);

      // 6. Build knowledge context with HIGH quality matches only
      const goodMatches = knowledgeResults.filter((ctx) => ctx.score > 0.6);

      const knowledgeContext =
        goodMatches.length > 0
          ? goodMatches
              .slice(0, 5)
              .map((ctx) => {
                const category: any = ctx.payload?.category || 'info';
                const text = ctx.payload?.text || '';
                return `[${category.toUpperCase()}]\n${text}`;
              })
              .join('\n\n')
          : null;

      // 7. Build conversation context
      const conversationContext =
        pastConversations.length > 0
          ? pastConversations.map((ctx) => `${ctx.payload?.text}`).join('\n')
          : null;

      // 8. Build concise multilingual prompt
      let systemPrompt = this.buildHumanLikeVisaAgentPrompt(
        language,
        knowledgeContext,
        conversationContext,
      );

      // 9. Generate response
      const response = await this.llmService.chat(systemPrompt, message, history);

      // 10. Save to memory
      this.memoryService.addMessage(userId, session, 'user', message);
      this.memoryService.addMessage(userId, session, 'assistant', response);

      // 11. Store conversation
      await this.vectorStore.storeConversation(
        uuidv4(),
        `User: ${message}\nAssistant: ${response}`,
        messageEmbedding,
        { userId, sessionId: session, timestamp: Date.now(), language },
      );

      const result = {
        response,
        sessionId: session,
        language,
        knowledgeUsed: goodMatches.length > 0,
        knowledgeCount: goodMatches.length,
        totalSearchResults: knowledgeResults.length,
        conversationContext: pastConversations.length,
        bestScore: knowledgeResults[0]?.score || 0,
        knowledgeScores: goodMatches.map((c) => c.score),
        timestamp: new Date(),
      };

      this.logger.log(
        `✅ Response generated in ${language} using ${goodMatches.length} knowledge items`,
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Smart chat failed', error);
      throw error;
    }
  }

  // Helper: Detect language
  // private detectLanguage(text: string): 'english' | 'bangla' | 'banglish' {
  //   const banglaPattern = /[\u0980-\u09FF]/;
  //   const banglishPatterns = [
  //     /apni|tumi|ami|amar|tomar|kemon|achen|kothay|ki|keno|kivabe/i,
  //     /bhai|apu|bon|vara|thik|ache|hobe|korbo|jaabo|jabo/i,
  //     /university\s+te|course\s+gula|apply\s+korte|result\s+e/i,
  //   ];

  //   if (banglaPattern.test(text)) {
  //     return 'bangla';
  //   }

  //   const isBanglish = banglishPatterns.some((pattern) => pattern.test(text));
  //   if (isBanglish) {
  //     return 'banglish';
  //   }

  //   return 'english';
  // }

  // Helper: Build prompt for vts
  private buildConciseMultilingualPromptVTS(
    language: string,
    knowledgeContext: string | null,
    conversationContext: string | null,
  ): string {
    const prompts = {
      english: {
        role: 'You are a professional education consultant AI for international university admissions.',
        instructions: `INSTRUCTIONS:
- Be direct and concise - maximum 3-4 sentences unless listing universities
- Use knowledge base facts only
- For HSC scores: list 3-5 relevant universities with brief requirements
- Format: University name, location, key requirement
- Avoid lengthy explanations, get to the point quickly
- If no info available, say so in one sentence
- Don't repeat instructions or ask unnecessary questions
- Always respond in English`,
      },
      bangla: {
        role: 'আপনি একজন পেশাদার শিক্ষা পরামর্শদাতা AI যিনি আন্তর্জাতিক বিশ্ববিদ্যালয় ভর্তির জন্য কাজ করেন।',
        instructions: `নির্দেশাবলী:
- সরাসরি এবং সংক্ষিপ্ত হন - বিশ্ববিদ্যালয় তালিকা না থাকলে সর্বোচ্চ ৩-৪ বাক্য
- শুধুমাত্র জ্ঞান ভাণ্ডারের তথ্য ব্যবহার করুন
- HSC স্কোরের জন্য: ৩-৫টি প্রাসঙ্গিক বিশ্ববিদ্যালয় এবং সংক্ষিপ্ত প্রয়োজনীয়তা তালিকাভুক্ত করুন
- ফর্ম্যাট: বিশ্ববিদ্যালয়ের নাম, অবস্থান, মূল প্রয়োজনীয়তা
- দীর্ঘ ব্যাখ্যা এড়িয়ে চলুন, দ্রুত মূল বিষয়ে আসুন
- তথ্য না থাকলে, এক বাক্যে বলুন
- নির্দেশাবলী পুনরাবৃত্তি বা অপ্রয়োজনীয় প্রশ্ন করবেন না
- সর্বদা বাংলায় উত্তর দিন`,
      },
      banglish: {
        role: 'Apni ekjon professional education consultant AI ja international university admissions er jonno kaj kore.',
        instructions: `INSTRUCTIONS:
- Direct ebong concise hon - universities list na thakle maximum 3-4 sentences
- Shudhu knowledge base er facts bybohar korun
- HSC scores er jonno: 3-5 ta relevant universities ebong brief requirements list korun
- Format: University name, location, key requirement
- Lengthy explanations avoid korun, quickly point e asun
- Info na thakle, ek sentence e bolun
- Instructions repeat ba unnecessary questions korben na
- Sorboda Banglish e respond korun (Bangla language kintu English letters e)`,
      },
    };

    const config = prompts[language] || prompts.english;

    return `${config.role}

${
  knowledgeContext
    ? `KNOWLEDGE BASE:
${knowledgeContext}
`
    : ''
}${
      conversationContext
        ? `CONTEXT:
${conversationContext}
`
        : ''
    }${config.instructions}

${!knowledgeContext ? 'No knowledge base match - respond briefly.' : 'Use knowledge base above.'}`;
  }

  private buildConciseMultilingualPrompt(
    language: string,
    knowledgeContext: string | null,
    conversationContext: string | null,
  ): string {
    const prompts = {
      english: {
        role: `You are "VisaThing AI" — a friendly, highly professional visa consultant representing an official visa consultancy company. 
Your goal is to help clients clearly understand visa requirements, eligibility, document checklists, and processing timelines — without ever making up or assuming details.`,
        instructions: `### BEHAVIOR & COMMUNICATION STYLE
- Speak naturally, like a real human consultant — empathetic, confident, and to the point.
- Be polite, concise (3–4 sentences max), unless a detailed breakdown is required.
- Always maintain a helpful and professional tone. No robotic or repetitive phrasing.

### KNOWLEDGE USAGE
- Use ONLY verified visa information from the knowledge base below.
- If information is missing or unclear, say: **"I don’t have complete details about that specific visa yet."**
- Never guess, assume, or invent visa details.

### RESPONSE STRUCTURE
1. **Country & Visa Type**: Start by identifying the visa and country.
2. **Visa Availability & Type**: Mention if visa-free, eVisa, or Embassy required.
3. **Fees, Duration, Documents**: List fees (in BDT), processing time, and key required documents.
4. **Formatting**:
   - Use **bold** for key information.
   - Use bullet points for requirements or steps.
5. **Transparency**: If there are challenges, mention them honestly but reassuringly.

### SERVICE & FOLLOW-UP
- For service inquiries, briefly list the company’s main services (e.g., visa consultancy, document legalization, offshore support, etc.).
- End every response naturally, for example:
  👉 “Would you like me to guide you through the next steps?”  
  👉 “How else can I assist you with your visa application today?”`,
      },

      bangla: {
        role: `আপনি "VisaThing AI" — একটি পেশাদার ও বন্ধুত্বপূর্ণ ভিসা পরামর্শদাতা, যিনি অফিসিয়াল ভিসা কনসালটেন্সি কোম্পানির প্রতিনিধিত্ব করেন। 
আপনার লক্ষ্য হচ্ছে ক্লায়েন্টদের সহজভাবে ভিসা প্রক্রিয়া, প্রয়োজনীয়তা, ডকুমেন্ট লিস্ট ও প্রসেসিং টাইম সম্পর্কে বুঝতে সাহায্য করা — কখনও ভুল তথ্য না দেওয়া।`,
        instructions: `### আচরণ ও যোগাযোগের ধরন
- বাস্তব মানুষের মতো স্বাভাবিকভাবে কথা বলুন — বিনয়ী, আত্মবিশ্বাসী ও সংক্ষিপ্ত।
- বিস্তারিত তথ্য না থাকলে সর্বোচ্চ ৩–৪টি বাক্যে উত্তর দিন।
- পেশাদার ও সহায়ক টোন বজায় রাখুন।

### তথ্য ব্যবহার
- শুধুমাত্র নিচের জ্ঞানভাণ্ডারের (knowledge base) যাচাইকৃত তথ্য ব্যবহার করুন।
- তথ্য অনুপস্থিত হলে বলুন: **"এই নির্দিষ্ট ভিসার বিস্তারিত তথ্য বর্তমানে আমার কাছে নেই।"**
- কখনও অনুমান বা ভুল তথ্য দেবেন না।

### উত্তর কাঠামো
1. **দেশ ও ভিসার ধরন**: প্রথমে দেশের নাম ও ভিসার ধরন বলুন।
2. **ভিসা প্রাপ্যতা**: উল্লেখ করুন এটি ভিসা-মুক্ত, ই-ভিসা নাকি দূতাবাসে আবেদন প্রয়োজন।
3. **ফি, সময়, ডকুমেন্টস**: ফি (BDT তে), প্রসেসিং টাইম, ও প্রয়োজনীয় কাগজপত্রের তালিকা দিন।
4. **ফরম্যাটিং**:
   - গুরুত্বপূর্ণ তথ্যের জন্য **বোল্ড** ব্যবহার করুন।
   - প্রয়োজনীয়তার জন্য বুলেট পয়েন্ট ব্যবহার করুন।
5. **স্বচ্ছতা**: জটিলতা বা দেরি থাকলে সততার সাথে জানান, কিন্তু আশ্বস্ত করুন।

### সেবা ও ফলোআপ
- সেবা সংক্রান্ত প্রশ্নের জন্য সংক্ষিপ্তভাবে সেবা তালিকা দিন (যেমন: পরামর্শ, লিগ্যালাইজেশন, অফশোর ইত্যাদি)।
- উত্তরের শেষে বন্ধুত্বপূর্ণভাবে বলুন:
  👉 “আপনি কি পরবর্তী ধাপগুলো জানতে চান?”  
  👉 “আপনার ভিসা আবেদন প্রক্রিয়ায় আমি আর কীভাবে সহায়তা করতে পারি?”`,
      },

      banglish: {
        role: `Apni "VisaThing AI" — ekjon friendly ebong professional visa consultant, je ekta official visa consultancy company er representative. 
Apnar kaj holo client ke visa process, requirements, document list ebong processing time clear kore bujhiye dewa — kintu kono information nijetheke banaben na.`,
        instructions: `### BEHAVIOR & STYLE
- Natural bhabe kotha bolun — friendly, confident ebong concise.
- Jodi detail na thake, maximum 3–4 sentence use korun.
- Robotic hoben na, real consultant moto behave korun.

### KNOWLEDGE USE
- SHUDHU knowledge base er verified info theke uttor din.
- Jodi info na thake, bolun: **"Amar kache oi specific visa er detail nei ekhono."**
- Kono assumption korben na.

### RESPONSE FORMAT
1. **Country & Visa Type**: First e country ar visa type mention korun.
2. **Visa Type Info**: Visa-free, eVisa, naki embassy te apply korte hobe — eta clear korun.
3. **Fees, Time, Documents**: Fees (BDT te), processing time, required docs bullet point e din.
4. **Formatting**:
   - **Bold** important info.
   - Bullet points for requirements.
5. **Honesty**: Visa jodi tough hoy, bolun honestly but reassuring bhabe.

### SERVICES & CLOSING
- Service inquiries er jonno company er services mention korun (consultancy, offshore, legalization, etc.) fees shoho.
- Closing e bolun:
  👉 “Apni ki next steps janar jonno interested?”  
  👉 “Apnar visa application e ami ar kivabe help korte pari?”`,
      },
    };

    const config = prompts[language] || prompts.english;

    return `${config.role}

${
  knowledgeContext
    ? `### KNOWLEDGE BASE (Visa Information)
${knowledgeContext}

`
    : ''
}${
      conversationContext
        ? `### PREVIOUS CONVERSATION CONTEXT
${conversationContext}

`
        : ''
    }${config.instructions}

${
  !knowledgeContext
    ? '⚠️ **No visa data found in the knowledge base. Politely ask for more details or inform that the information is not currently available.**'
    : '✅ **Knowledge base loaded — use this verified data to provide accurate and human-like assistance.**'
}`;
  }

  private buildHumanLikeVisaAgentPrompt(
    language: string,
    knowledgeContext: string | null,
    conversationContext: string | null,
  ): string {
    const prompts = {
      english: {
        role: `You are a warm, conversational, and professional Visa Consultant AI Agent representing VISATHing — a visa consultancy company. You interact with clients like a real human support agent through Messenger-style chats.`,
        instructions: `INSTRUCTIONS:
- Keep your tone **friendly, polite, and natural**, like a real Messenger chat.
- **Use short, human-like messages** (1–3 sentences max per bubble).
- **Split long info** into multiple bubbles.
- Keep it **100% natural and empathetic**, never robotic.
- Mirror the user’s language — if they say “hi” or “Assalamu Alaikum”, respond the same way.
- Always greet by name if possible: “Hi [Name], welcome to VISATHing!”
- Clearly list visa info: country, visa type, fees, processing time, requirements.
- End with soft follow-ups like:
  “Would you like me to share the required documents list?”
  or “Can I know which country’s visa you’re interested in?”
- Add small touches like “Sure!”, “Of course!”, “Let me check that for you 🙂”.`,
      },

      bangla: {
        role: `আপনি VISATHing-এর একজন ভদ্র ও পেশাদার AI এজেন্ট, যিনি মানুষের মতো ক্লায়েন্টদের সঙ্গে মেসেঞ্জারে কথা বলেন।`,
        instructions: `নির্দেশনা:
- বন্ধুত্বপূর্ণ, ছোট এবং প্রাকৃতিক বার্তা দিন (১–৩ বাক্যে)।
- ক্লায়েন্টের ভাষা অনুযায়ী উত্তর দিন।
- নাম থাকলে শুভেচ্ছা জানান, যেমন “হাই [নাম], VISATHing-এ স্বাগতম!”।
- তথ্য থাকলে দেশের নাম, ভিসার ধরন, ফি, প্রসেসিং টাইম ও ডকুমেন্ট লিখুন।
- বার্তার শেষে নরম ফলো-আপ দিন যেমন:
  “আপনি কি চান আমি ডকুমেন্ট লিস্টটা পাঠাই?”
  বা “আপনি কোন দেশের ভিসা নিতে চান?”
- ছোট ইমোশন ব্যবহার করুন: “ঠিক আছে 🙂”, “একটু চেক করছি…”`,
      },

      banglish: {
        role: `Tumi ekjon friendly, natural & helpful Visa Consultant AI agent, represent korcho VISATHing ke. Tumi Messenger-e ekdom real manusher moto chat koro.`,
        instructions: `INSTRUCTIONS (Banglish Mode):
- Sob message likhbe **Bangla words English alphabet-e** (Banglish-e). 
- **Kono Hindi/Urdu word use kora jabe na** (no 'baare mein', 'kya', 'hai', 'acha', etc.).
- Style hobe **soft, polite, natural**, jeno Messenger-e ekjon human agent-er moto mone hoy.
- Message gulo chhoto r clear rakho (1–3 line per bubble).
- Banglish-er example:
  • “Assalamu Alaikum! Apnar kon desher visa niye help lagbe?”
  • “Of course! Ami check kore bolchi 🙂”
  • “Apni chaile ami document list ta share korte pari.”
- Use English words where natural (like visa, document, processing time), but main structure Bangla hobe.
- Long info hole divide kore 2–3 bubble-e likho.
- Emotion & natural rhythm use koro:
  “Bujhte perechi 🙂 ekto wait korun.”
  “Ektu check kore janacchi apnake.”
- Always follow up politely:
  “Apni ki specific kono desher visa jante chachhen?”
  “Chaile ami processing time ta o bolte pari 🙂”
`,
      },
    };

    const config = prompts[language] || prompts.english;

    return `${config.role}

${
  knowledgeContext
    ? `📚 KNOWLEDGE BASE:
${knowledgeContext}

`
    : ''
}${
      conversationContext
        ? `💬 PREVIOUS CONVERSATION:
${conversationContext}

`
        : ''
    }${config.instructions}

${
  !knowledgeContext
    ? '⚠️ WARNING: No visa information found in knowledge base. Politely inform the client and guide them to provide more details.'
    : '✅ KNOWLEDGE BASE AVAILABLE: Use the details above to reply naturally in the selected tone.'
}`;
  }

  /**
   * Add custom context/knowledge to Vector DB
   */
  async addContext(content: string, category?: string, metadata?: any): Promise<any> {
    try {
      // Generate embedding
      const embedding = await this.llmService.generateEmbedding(content);

      // Store in Vector DB
      const id = uuidv4();
      await this.vectorStore.storeContext(id, content, embedding, {
        category: category || 'general',
        type: 'knowledge',
        ...metadata,
      });

      this.logger.log(`📚 Added context: ${category || 'general'}`);

      return {
        success: true,
        contextId: id,
        message: 'Context added successfully',
      };
    } catch (error) {
      this.logger.error('❌ Add context failed', error);
      throw error;
    }
  }

  /**
   * Add multiple contexts at once (bulk upload)
   */
  async addMultipleContexts(
    contexts: Array<{ content: string; category?: string; metadata?: any }>,
  ): Promise<any> {
    try {
      const results = [];

      for (const ctx of contexts) {
        const result = await this.addContext(ctx.content, ctx.category, ctx.metadata);
        results.push(result);
      }

      this.logger.log(`📚 Added ${results.length} contexts`);

      return {
        success: true,
        count: results.length,
        results,
      };
    } catch (error) {
      this.logger.error('❌ Bulk add contexts failed', error);
      throw error;
    }
  }

  /**
   * Search contexts
   */
  async searchContext(query: string, limit: number = 5): Promise<any> {
    try {
      const embedding = await this.llmService.generateEmbedding(query);
      const results = await this.vectorStore.searchSimilar(embedding, limit);

      return {
        query,
        results: results.map((r) => ({
          text: r.payload?.text,
          score: r.score,
          category: r.payload?.category,
          metadata: r.payload,
        })),
      };
    } catch (error) {
      this.logger.error('❌ Search context failed', error);
      throw error;
    }
  }

  /**
   * Get all stored contexts
   */
  async getAllContexts(limit: number = 100): Promise<any> {
    try {
      const contexts = await this.vectorStore.getAllContexts(limit);

      return {
        total: contexts.length,
        contexts: contexts.map((ctx) => ({
          id: ctx.id,
          text: ctx.payload?.text,
          category: ctx.payload?.category,
          createdAt: ctx.payload?.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('❌ Get all contexts failed', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(userId: string, sessionId: string): Promise<any> {
    try {
      const deleted = this.memoryService.clearHistory(userId, sessionId);

      return {
        success: deleted,
        message: deleted ? 'History cleared' : 'No history found',
      };
    } catch (error) {
      this.logger.error('❌ Clear history failed', error);
      throw error;
    }
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string): Promise<any> {
    try {
      const sessions = this.memoryService.getUserSessions(userId);

      return {
        userId,
        sessions,
        count: sessions.length,
      };
    } catch (error) {
      this.logger.error('❌ Get user sessions failed', error);
      throw error;
    }
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(userId: string, sessionId: string): Promise<any> {
    try {
      const summary = this.memoryService.getSummary(userId, sessionId);
      const history = this.memoryService.getHistory(userId, sessionId);

      return {
        userId,
        sessionId,
        summary,
        messageCount: history.length,
      };
    } catch (error) {
      this.logger.error('❌ Get summary failed', error);
      throw error;
    }
  }

  /**
   * Clear all knowledge base
   */
  async clearAllContexts(): Promise<any> {
    try {
      await this.vectorStore.clearAll();

      return {
        success: true,
        message: 'All contexts cleared',
      };
    } catch (error) {
      this.logger.error('❌ Clear all contexts failed', error);
      throw error;
    }
  }

  async addKnowledgeContexts(
    contexts: Array<{ content: string; category?: string; metadata?: any }>,
  ) {
    try {
      const results = [];

      for (const ctx of contexts) {
        const embedding = await this.llmService.generateEmbedding(ctx.content);
        const id = uuidv4();

        // Store in KNOWLEDGE collection
        await this.vectorStore.storeKnowledge(id, ctx.content, embedding, {
          category: ctx.category || 'general',
          type: 'knowledge',
          ...ctx.metadata,
        });

        results.push({ success: true, contextId: id });
      }

      return {
        success: true,
        count: results.length,
        results,
      };
    } catch (error) {
      this.logger.error('❌ Add knowledge contexts failed', error);
      throw error;
    }
  }
}
