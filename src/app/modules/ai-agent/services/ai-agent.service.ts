import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { MemoryService } from './memory.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);

  private readonly defaultSystemContext = `You are a helpful AI assistant.
You are friendly, professional, and knowledgeable.
Always provide accurate and helpful responses.
If you don't know something, admit it honestly.`;

  // Common countries list for detection
  private readonly COUNTRIES = [
    'australia',
    'canada',
    'usa',
    'united states',
    'uk',
    'united kingdom',
    'germany',
    'france',
    'italy',
    'spain',
    'netherlands',
    'sweden',
    'norway',
    'denmark',
    'finland',
    'japan',
    'korea',
    'south korea',
    'singapore',
    'malaysia',
    'uae',
    'dubai',
    'saudi arabia',
    'turkey',
    'pakistan',
    'india',
    'bangladesh',
    'nepal',
    'sri lanka',
    'china',
    'russia',
    'brazil',
    'mexico',
    'south africa',
    'new zealand',
    'ireland',
    'portugal',
    'switzerland',
  ];

  constructor(
    private vectorStore: VectorStoreService,
    private llmService: LlmService,
    private memoryService: MemoryService,
  ) {
    this.logger.log('✅ AI Agent Service initialized');
  }

  private availableCountriesCache: string[] = [];
  private cacheLastUpdated: number = 0;
  private CACHE_TTL = 300000; // 5 minutes

  // ADD THIS NEW METHOD
  private async refreshAvailableCountries(): Promise<void> {
    try {
      const allKnowledge: any = await this.vectorStore.getAllKnowledge(500);
      const countriesFound = new Set<string>();

      for (const item of allKnowledge) {
        const text = (item.payload?.text || '').toLowerCase();

        for (const country of this.COUNTRIES) {
          if (text.includes(country)) {
            countriesFound.add(country);
          }
        }
      }

      this.availableCountriesCache = Array.from(countriesFound);
      this.cacheLastUpdated = Date.now();

      this.logger.log(`🌍 Available countries: ${this.availableCountriesCache.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to refresh countries', error);
    }
  }

  // ADD THIS NEW METHOD
  private async getAvailableCountries(): Promise<string[]> {
    const cacheAge = Date.now() - this.cacheLastUpdated;

    if (cacheAge > this.CACHE_TTL || this.availableCountriesCache.length === 0) {
      await this.refreshAvailableCountries();
    }

    return this.availableCountriesCache;
  }

  /**
   * Smart Chat - Main conversation handler
   */
  async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      const session = sessionId || uuidv4();

      // 1. Detect language
      const language = this.detectLanguage(message);
      this.logger.log(`🌍 Language: ${language}`);

      // 2. Analyze user intent
      const intent = this.analyzeIntent(message);
      this.logger.log(`🎯 Intent: ${intent.type}`);

      // 3. Extract country from message
      const extractedCountry = this.extractCountry(message);
      this.logger.log(`🏳️ Country in message: ${extractedCountry || 'none'}`);

      // 4. Get conversation history
      const history = this.memoryService.getHistory(userId, session);
      console.log('🚀 ~ AiAgentService ~ smartChat ~ history:', history);

      // 5. Get available countries from knowledge base
      const availableCountries = await this.getAvailableCountries();
      console.log('🚀 ~ AiAgentService ~ smartChat ~ availableCountries:', availableCountries);

      // 6. Generate embedding and search
      const messageEmbedding = await this.llmService.generateEmbedding(message);
      const knowledgeResults = await this.vectorStore.searchKnowledge(messageEmbedding, 8, 0.65);

      this.logger.log(`📚 Found ${knowledgeResults.length} knowledge items`);

      // 7. Filter and validate knowledge
      let validKnowledge = knowledgeResults;
      if (extractedCountry) {
        validKnowledge = this.filterKnowledgeByCountry(knowledgeResults, extractedCountry);
        this.logger.log(`🔍 Filtered to ${validKnowledge.length} items for ${extractedCountry}`);
      }

      // 8. Build knowledge context
      const knowledgeContext = this.buildKnowledgeContext(validKnowledge);

      // 9. Build system prompt
      const systemPrompt = this.buildSystemPrompt(
        language,
        intent,
        knowledgeContext,
        extractedCountry,
        availableCountries,
      );

      // 10. Generate response
      let response = await this.llmService.chat(systemPrompt, message, history);

      // 11. Post-process response
      response = this.postProcessResponse(response, language, message, extractedCountry);

      // 12. Save to memory
      this.memoryService.addMessage(userId, session, 'user', message);
      this.memoryService.addMessage(userId, session, 'assistant', response);

      // 13. Store conversation in vector DB
      await this.vectorStore.storeConversation(
        uuidv4(),
        `User: ${message}\nAssistant: ${response}`,
        messageEmbedding,
        {
          userId,
          sessionId: session,
          timestamp: Date.now(),
          language,
          intent: intent.type,
          country: extractedCountry,
        },
      );

      return {
        response,
        sessionId: session,
        language,
        intent: intent.type,
        knowledgeUsed: validKnowledge.length > 0,
        knowledgeCount: validKnowledge.length,
        bestScore: validKnowledge[0]?.score || 0,
        country: extractedCountry,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Smart chat failed', error);
      throw error;
    }
  }

  /**
   * Extract country name from message
   */
  private extractCountry(message: string): string | null {
    const lowerMsg = message.toLowerCase();

    for (const country of this.COUNTRIES) {
      if (lowerMsg.includes(country)) {
        return country;
      }
    }

    return null;
  }

  /**
   * Filter knowledge by country relevance
   */
  private filterKnowledgeByCountry(results: any[], targetCountry: string): any[] {
    return results.filter((result) => {
      const text = result.payload?.text?.toLowerCase() || '';
      const category = result.payload?.category?.toLowerCase() || '';

      // Check if the knowledge mentions the target country
      if (text.includes(targetCountry.toLowerCase())) {
        return true;
      }

      // If it's general info (not country-specific), keep it
      if (category === 'general_faq' || category === 'assessment' || category === 'requirements') {
        // Only keep if it doesn't mention OTHER countries
        const mentionsOtherCountry = this.COUNTRIES.some(
          (country) => country !== targetCountry && text.includes(country.toLowerCase()),
        );
        return !mentionsOtherCountry;
      }

      return false;
    });
  }

  /**
   * Build knowledge context string
   */
  private buildKnowledgeContext(results: any[]): string | null {
    if (results.length === 0) return null;

    const contexts = results
      .slice(0, 3)
      .map((r) => r.payload?.text || '')
      .filter((t) => t.length > 0);

    return contexts.length > 0 ? contexts.join('\n\n---\n\n') : null;
  }

  /**
   * Detect language
   */
  private detectLanguage(message: string): string {
    const banglaPattern = /[\u0980-\u09FF]/;
    if (banglaPattern.test(message)) {
      return 'bangla';
    }

    const englishPattern = /^[A-Za-z0-9\s\.,!?'"@#$%&*()-_+=;:<>\/\[\]{}]+$/;
    if (englishPattern.test(message)) {
      return 'english';
    }

    const banglishKeywords = [
      'ami',
      'apni',
      'tumi',
      'kemon',
      'achen',
      'chai',
      'pari',
      'hobe',
      'thik',
      'jabo',
      'bolun',
      'ki',
      'kivabe',
    ];
    const lowerMsg = message.toLowerCase();
    if (banglishKeywords.some((word) => lowerMsg.includes(word))) {
      return 'banglish';
    }

    return 'english';
  }

  /**
   * Analyze intent
   */
  private analyzeIntent(message: string): { type: string; needsDetailed: boolean } {
    const lowerMsg = message.toLowerCase();

    if (/^(hi|hello|hey|hy|hii|hlw|assalam)/i.test(lowerMsg)) {
      return { type: 'greeting', needsDetailed: false };
    }

    if (
      lowerMsg.includes('visa') ||
      lowerMsg.includes('document') ||
      lowerMsg.includes('requirement')
    ) {
      return { type: 'visa_inquiry', needsDetailed: true };
    }

    if (
      lowerMsg.includes('university') ||
      lowerMsg.includes('college') ||
      lowerMsg.includes('study')
    ) {
      return { type: 'education_inquiry', needsDetailed: true };
    }

    if (
      lowerMsg.includes('service') ||
      lowerMsg.includes('country') ||
      lowerMsg.includes('which')
    ) {
      return { type: 'service_inquiry', needsDetailed: false };
    }

    if (lowerMsg.match(/^(yes|ok|okay|no|sure|alright|fine)$/i)) {
      return { type: 'confirmation', needsDetailed: false };
    }

    return { type: 'general', needsDetailed: false };
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(
    language: string,
    intent: { type: string; needsDetailed: boolean },
    knowledgeContext: string | null,
    country: string | null,
    availableCountries: string[],
  ): string {
    const prompts = {
      english: {
        role: `You are a friendly Visa Consultant for VISATHing. You help with visa applications and study abroad guidance.`,

        greeting: `When user greets, respond warmly and ask how you can help. Keep it 1-2 sentences.`,

        inquiry: `When answering visa or study questions:
- If you have relevant information, share the key points (2-3 sentences max)
- Ask ONE follow-up question to help them better
- Be specific and direct
- NEVER mention countries not in your knowledge base unless the user specifically asks`,

        service: `When asked about services or countries:
🚨 CRITICAL: You can ONLY provide services for these countries:
${availableCountries.length > 0 ? availableCountries.join(', ') : 'NONE'}

- ONLY mention these countries, never others
- If they ask about a country not in this list, say you don't have info
- Be honest and specific
- Ask which of THESE countries they're interested in`,

        confirmation: `When user says yes/ok/no:
- Acknowledge their response
- Continue the conversation naturally based on context
- Ask for the NEXT piece of information needed
- Don't repeat what was just discussed`,

        noInfo: `When you don't have information:
- Be honest: "I don't have specific information about {country} at the moment."
- Don't offer alternatives unless they make sense
- Ask if they want to know about something else`,
      },

      bangla: {
        role: `আপনি VISATHing-এর বন্ধুত্বপূর্ণ ভিসা কনসালট্যান্ট। আপনি ভিসা আবেদন ও বিদেশে পড়াশোনায় সাহায্য করেন।`,

        greeting: `যখন শুভেচ্ছা, উষ্ণভাবে সাড়া দিন এবং কীভাবে সাহায্য করতে পারেন জিজ্ঞাসা করুন। ১-২ বাক্য।`,

        inquiry: `ভিসা বা পড়াশোনার প্রশ্নের উত্তরে:
- প্রাসঙ্গিক তথ্য থাকলে মূল পয়েন্ট শেয়ার করুন (সর্বোচ্চ ২-৩ বাক্য)
- একটি ফলো-আপ প্রশ্ন করুন
- সরাসরি এবং নির্দিষ্ট হন`,

        service: `সেবা বা দেশ সম্পর্কে জিজ্ঞাসায়:
🚨 গুরুত্বপূর্ণ: আপনি শুধুমাত্র এই দেশগুলির জন্য সেবা দিতে পারেন: ${availableCountries.join(', ')}

- শুধুমাত্র উপরের দেশগুলি উল্লেখ করুন, অন্য কোনো দেশ নয়
- যদি তারা তালিকায় নেই এমন দেশ সম্পর্কে জিজ্ঞাসা করে, বলুন আপনার তথ্য নেই
- সৎ হন: "আমার বর্তমানে [দেশের তালিকা] সম্পর্কে তথ্য আছে"
- এই দেশগুলির মধ্যে কোনটিতে তারা আগ্রহী জিজ্ঞাসা করুন`,

        confirmation: `যখন ব্যবহারকারী হ্যাঁ/ঠিক আছে/না বলে:
- তাদের উত্তর স্বীকার করুন
- প্রসঙ্গ অনুযায়ী স্বাভাবিকভাবে চালিয়ে যান
- পরবর্তী প্রয়োজনীয় তথ্যের জন্য জিজ্ঞাসা করুন`,

        noInfo: `যখন তথ্য নেই:
- সৎ থাকুন: "আমার কাছে {country} সম্পর্কে নির্দিষ্ট তথ্য নেই।"
- অপ্রাসঙ্গিক বিকল্প দেবেন না`,
      },

      banglish: {
        role: `Tumi VISATHing-er friendly Visa Consultant. Tumi visa application aar study abroad-e help koro.`,

        greeting: `Greet korle warmly respond koro aar ki help korte paro jigges koro. 1-2 sentence.`,

        inquiry: `Visa ba study question-er answer-e:
- Relevant info thakle key points share koro (max 2-3 sentence)
- EK follow-up question koro
- Direct aar specific hobe`,

        service: `Service ba country jigges korle:
🚨 IMPORTANT: Tumi SHUDHU ei countries-er jonno service dite paro: ${availableCountries.join(', ')}

- SHUDHU uporer countries mention koro, onno kono country na
- Jodi tara list-e nei emon country jigges kore, bolo tomar info nei
- Honest hoye bolo: "Amar kache [country list] somporkhe info ache"
- EI countries-er moddhe konta interested jigges koro`,

        confirmation: `Jokhn yes/ok/no bole:
- Response acknowledge koro
- Context onujayi naturally continue koro
- Next information-er jonno jigges koro`,

        noInfo: `Jokhn info nei:
- Honest hao: "Amar kache {country} somporkhe specific info nei."
- Irrelevant alternative dio na`,
      },
    };

    const config = prompts[language] || prompts.english;
    let guideText = '';

    if (intent.type === 'greeting') {
      guideText = config.greeting;
    } else if (intent.type === 'service_inquiry') {
      guideText = config.service;
    } else if (intent.type === 'confirmation') {
      guideText = config.confirmation;
    } else if (intent.type === 'visa_inquiry' || intent.type === 'education_inquiry') {
      guideText = config.inquiry;
    } else {
      guideText = config.inquiry;
    }

    let prompt = `${config.role}\n\n`;

    if (knowledgeContext) {
      prompt += `📚 RELEVANT INFORMATION:\n${knowledgeContext}\n\n`;
    }

    prompt += `📋 GUIDELINES:\n${guideText}\n\n`;

    if (country && !knowledgeContext) {
      prompt += `⚠️ NO INFORMATION ABOUT ${country.toUpperCase()}\n${config.noInfo.replace('{country}', country)}\n\n`;
    }

    prompt += `🎯 RESPONSE RULES:
- Maximum 3 sentences total
- End with ONE question (not multiple)
- Use simple, natural language like messenger chat
- Add ONE emoji naturally 😊
- Be consistent with previous conversation
- If you don't know, say so directly

🚨 CRITICAL: 
- NEVER mention countries you don't have information about
- ONLY talk about countries that appear in the knowledge base above
- If asked about a country not in your knowledge, say you don't have info about it`;

    prompt += `\n🌍 AVAILABLE COUNTRIES IN KNOWLEDGE BASE:
${availableCountries.join(', ')}

🚨 ABSOLUTE RULE: NEVER mention any country not in the above list!`;

    return prompt;
  }

  /**
   * Post-process response
   */
  private postProcessResponse(
    response: string,
    language: string,
    userMessage: string,
    extractedCountry: string | null,
  ): string {
    // Clean up
    response = response.replace(/\s+/g, ' ').trim();

    // Split into sentences
    let sentences = response.split(/([.!?]+)/).reduce((acc, part, i, arr) => {
      if (i % 2 === 0 && part.trim()) {
        acc.push(part.trim() + (arr[i + 1] || ''));
      }
      return acc;
    }, [] as string[]);

    // Limit to 3 sentences
    if (sentences.length > 3) {
      sentences = sentences.slice(0, 3);
    }

    // Check for country mismatch
    const responseCountries = this.extractCountriesFromText(response);
    if (extractedCountry && responseCountries.length > 0) {
      const hasMatchingCountry = responseCountries.some(
        (c) => c.toLowerCase() === extractedCountry.toLowerCase(),
      );
      const hasDifferentCountry = responseCountries.some(
        (c) => c.toLowerCase() !== extractedCountry.toLowerCase(),
      );

      if (hasDifferentCountry && !hasMatchingCountry) {
        // Response talks about wrong country
        return this.generateNoInfoResponse(extractedCountry, language);
      }
    }

    // Ensure exactly one question
    const questionCount = (response.match(/\?/g) || []).length;
    if (questionCount > 1) {
      const firstQuestionIndex = response.indexOf('?');
      response = response.substring(0, firstQuestionIndex + 1);
      sentences = response.split(/([.!?]+)/).reduce((acc, part, i, arr) => {
        if (i % 2 === 0 && part.trim()) {
          acc.push(part.trim() + (arr[i + 1] || ''));
        }
        return acc;
      }, [] as string[]);
    }

    // Add question if missing
    if (!response.includes('?')) {
      const followUps = {
        english: 'How can I help further?',
        bangla: 'আর কীভাবে সাহায্য করতে পারি?',
        banglish: 'Ar ki help korte pari?',
      };
      sentences.push(followUps[language] || followUps.english);
    }

    return sentences.join('\n');
  }

  /**
   * Extract countries mentioned in text
   */
  private extractCountriesFromText(text: string): string[] {
    const lowerText = text.toLowerCase();
    const found: string[] = [];

    for (const country of this.COUNTRIES) {
      if (lowerText.includes(country)) {
        found.push(country);
      }
    }

    return found;
  }

  /**
   * Generate "no info" response
   */
  private generateNoInfoResponse(country: string, language: string): string {
    const responses = {
      english: `I don't have specific information about ${country} at the moment. 😊\nWhich other country are you interested in?`,
      bangla: `আমার কাছে ${country} সম্পর্কে নির্দিষ্ট তথ্য নেই। 😊\nআপনি আর কোন দেশে আগ্রহী?`,
      banglish: `Amar kache ${country} somporkhe specific info nei. 😊\nApni ar kon deshe interested?`,
    };

    return responses[language] || responses.english;
  }

  /**
   * Simple chat - Basic conversation without context retrieval
   */
  async simpleChat(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      const session = sessionId || uuidv4();
      const history = this.memoryService.getHistory(userId, session);
      const response = await this.llmService.chat(this.defaultSystemContext, message, history);

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
   * Add custom context/knowledge to Vector DB
   */
  async addContext(content: string, category?: string, metadata?: any): Promise<any> {
    try {
      const embedding = await this.llmService.generateEmbedding(content);
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
   * Add multiple contexts at once
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
   * Add knowledge contexts (for bulk loading)
   */
  async addKnowledgeContexts(
    contexts: Array<{ content: string; category?: string; metadata?: any }>,
  ) {
    try {
      const results = [];

      for (const ctx of contexts) {
        const embedding = await this.llmService.generateEmbedding(ctx.content);
        const id = uuidv4();

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
        history,
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
}
