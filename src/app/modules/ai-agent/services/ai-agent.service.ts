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

  constructor(
    private vectorStore: VectorStoreService,
    private llmService: LlmService,
    private memoryService: MemoryService,
  ) {
    this.logger.log('✅ AI Agent Service initialized');
  }

  /**
   * IMPROVED Smart Chat with Human-like Responses
   */
  async smartChat(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      const session = sessionId || uuidv4();

      // 1. Detect language accurately
      const language = this.detectLanguage(message);
      this.logger.log(`🌐 Detected language: ${language}`);

      // 2. Analyze user intent
      const intent = this.analyzeIntent(message);
      this.logger.log(`🎯 Intent: ${intent.type}`);

      // 3. Generate embedding
      const messageEmbedding = await this.llmService.generateEmbedding(message);

      // 4. Search knowledge base with targeted results
      const searchLimit = intent.needsDetailed ? 5 : 3;
      const knowledgeResults = await this.vectorStore.searchKnowledge(
        messageEmbedding,
        searchLimit,
      );

      this.logger.log(`🔍 Search: "${message}"`);
      this.logger.log(`📊 Found ${knowledgeResults.length} items`);

      // 5. Get session history
      const history = this.memoryService.getHistory(userId, session);
      console.log('🚀 ~ AiAgentService ~ smartChat ~ history:', history);

      // 6. Filter high-quality matches (stricter threshold)
      const goodMatches = knowledgeResults.filter((ctx) => ctx.score > 0.65);

      // 7. Build minimal knowledge context
      const knowledgeContext =
        goodMatches.length > 0
          ? goodMatches
              .slice(0, 3)
              .map((ctx) => {
                const text = ctx.payload?.text || '';
                return text;
              })
              .join('\n---\n')
          : null;

      // 8. Build human-like prompt
      const systemPrompt = this.buildHumanLikeVisaAgentPrompt(language, knowledgeContext, intent);

      // 9. Generate response
      let response = await this.llmService.chat(systemPrompt, message, history);

      // 9.5 POST-PROCESS: Enforce strict limits
      response = this.enforceResponseLimits(response, language);

      // 9.6 POST-PROCESS: Validate country matching
      response = this.validateCountryMatch(message, response, knowledgeContext);

      // Log response metrics
      const wordCount = response.split(/\s+/).length;
      const sentenceCount = (response.match(/[.!?]+/g) || []).length;
      this.logger.log(`📏 Response: ${sentenceCount} sentences, ${wordCount} words`);

      if (wordCount > 50 || sentenceCount > 3) {
        this.logger.error(
          `❌ RESPONSE QUALITY ISSUE: ${wordCount} words, ${sentenceCount} sentences`,
        );
      }

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
        intent: intent.type,
        knowledgeUsed: goodMatches.length > 0,
        knowledgeCount: goodMatches.length,
        bestScore: knowledgeResults[0]?.score || 0,
        timestamp: new Date(),
      };

      this.logger.log(`✅ Response in ${language} using ${goodMatches.length} knowledge items`);

      return result;
    } catch (error) {
      this.logger.error('❌ Smart chat failed', error);
      throw error;
    }
  }

  /**
   * IMPROVED Language Detection
   */
  private detectLanguage(message: string): string {
    const banglaPattern = /[\u0980-\u09FF]/;
    const hasBanglaScript = banglaPattern.test(message);

    // Check for pure English (no Bangla characters)
    const englishPattern = /^[A-Za-z0-9\s\.,!?'"@#$%&*()-_+=;:<>\/\[\]{}]+$/;
    const isPureEnglish = englishPattern.test(message);

    if (isPureEnglish) {
      return 'english';
    }

    if (hasBanglaScript) {
      return 'bangla';
    }

    // Banglish detection - English letters but Bangla words
    const banglishKeywords = [
      'ami',
      'apni',
      'apnar',
      'tumi',
      'kemon',
      'achen',
      'korte',
      'chai',
      'pari',
      'hobe',
      'kore',
      'thik',
      'ase',
      'jabo',
      'chaile',
      'bolun',
      'janai',
      'deben',
      'korben',
      'jante',
      'chaichen',
      'ektu',
      'ki',
      'kivabe',
      'keno',
      'kothai',
      'kokhon',
    ];
    const lowerMsg = message.toLowerCase();
    const hasBanglishWords = banglishKeywords.some((word) => lowerMsg.split(/\s+/).includes(word));

    if (hasBanglishWords) {
      return 'banglish';
    }

    return 'english';
  }

  /**
   * IMPROVED Intent Analysis
   */
  private analyzeIntent(message: string): { type: string; needsDetailed: boolean } {
    const lowerMsg = message.toLowerCase();

    // Greeting
    if (
      lowerMsg.match(/^(hi|hello|hey|assalamu alaikum|salam|hola|hy|hii|hlw)/i) ||
      lowerMsg.match(/(kemon achen|kemn acho|ki khobor|assalamualaikum)/i)
    ) {
      return { type: 'greeting', needsDetailed: false };
    }

    // Specific visa inquiry
    if (
      lowerMsg.includes('visa') ||
      lowerMsg.includes('document') ||
      lowerMsg.includes('kagoj') ||
      lowerMsg.includes('requirement') ||
      lowerMsg.includes('dorkar')
    ) {
      return { type: 'visa_inquiry', needsDetailed: true };
    }

    // Country/University inquiry
    if (
      lowerMsg.includes('university') ||
      lowerMsg.includes('country') ||
      lowerMsg.includes('college') ||
      lowerMsg.includes('deshe') ||
      lowerMsg.includes('admission')
    ) {
      return { type: 'education_inquiry', needsDetailed: true };
    }

    // Process/timeline inquiry
    if (
      lowerMsg.includes('time') ||
      lowerMsg.includes('long') ||
      lowerMsg.includes('process') ||
      lowerMsg.includes('kotodin') ||
      lowerMsg.includes('lagbe')
    ) {
      return { type: 'process_inquiry', needsDetailed: false };
    }

    // General question
    return { type: 'general', needsDetailed: false };
  }

  /**
   * POST-PROCESSOR: Validate country matching
   */
  private validateCountryMatch(
    userMessage: string,
    response: string,
    knowledgeContext: string | null,
  ): string {
    // List of common countries
    const countries = [
      'australia',
      'canada',
      'usa',
      'uk',
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
      'singapore',
      'malaysia',
      'uae',
      'saudi',
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

    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Find country mentioned by user
    const userCountry = countries.find((country) => lowerMessage.includes(country));

    if (userCountry) {
      // Check if response talks about the same country
      if (!lowerResponse.includes(userCountry)) {
        // Response talks about different country
        const responseCountry = countries.find(
          (country) => lowerResponse.includes(country) && country !== userCountry,
        );

        if (responseCountry) {
          this.logger.warn(
            `⚠️ COUNTRY MISMATCH: User asked ${userCountry}, AI responded ${responseCountry}`,
          );

          // Override with correct response
          return `I don't have specific information about ${userCountry} right now. 😊\nWould you like information about ${responseCountry} instead?`;
        }
      }
    }

    return response;
  }

  /**
   * POST-PROCESSOR: Enforce strict response limits
   */
  private enforceResponseLimits(response: string, language: string): string {
    // 1. Remove excessive spaces
    response = response.replace(/\s+/g, ' ').trim();

    // 2. Split into sentences
    let sentences = response.split(/([.!?]+)/).reduce((acc, part, i, arr) => {
      if (i % 2 === 0 && part.trim()) {
        const sentence = part.trim() + (arr[i + 1] || '');
        acc.push(sentence);
      }
      return acc;
    }, [] as string[]);

    // 3. Limit to 3 sentences MAX
    if (sentences.length > 3) {
      sentences = sentences.slice(0, 3);
      this.logger.warn(`⚠️ Response truncated from ${sentences.length} to 3 sentences`);
    }

    // 4. CRITICAL: Ensure exactly ONE question
    const questionCount = (response.match(/\?/g) || []).length;
    if (questionCount > 1) {
      this.logger.warn(`⚠️ Multiple questions detected (${questionCount}), keeping only first`);

      // Find first question and everything before it
      const firstQuestionIndex = response.indexOf('?');
      if (firstQuestionIndex !== -1) {
        response = response.substring(0, firstQuestionIndex + 1);

        // Re-split into sentences after truncation
        sentences = response.split(/([.!?]+)/).reduce((acc, part, i, arr) => {
          if (i % 2 === 0 && part.trim()) {
            const sentence = part.trim() + (arr[i + 1] || '');
            acc.push(sentence);
          }
          return acc;
        }, [] as string[]);
      }
    }

    // 5. Check word count
    const wordCount = sentences.join(' ').split(/\s+/).length;
    if (wordCount > 50) {
      this.logger.warn(`⚠️ Response too long: ${wordCount} words, keeping first 2 sentences`);
      sentences = sentences.slice(0, 2);
    }

    // 6. Ensure ends with question (if no question exists, add one)
    const finalText = sentences.join(' ');
    if (!finalText.includes('?')) {
      const followUps = {
        english: 'What else can I help with?',
        bangla: 'আর কিছু জানতে চান?',
        banglish: 'Ar kichu jante chan?',
      };
      sentences.push(followUps[language] || followUps.english);
    }

    // 7. Join with line breaks for better readability
    return sentences.join('\n');
  }

  /**
   * IMPROVED Human-like Prompt Builder
   */
  private buildHumanLikeVisaAgentPrompt(
    language: string,
    knowledgeContext: string | null,
    intent: { type: string; needsDetailed: boolean },
  ): string {
    const prompts = {
      english: {
        role: `You are a friendly Visa Consultant AI for VISATHing. Chat naturally like a human agent on Messenger.`,

        greeting: `When user greets:
- Respond warmly: "Hey there! 😊" or "Hi! Welcome to VISATHing!"
- Ask ONE simple question: "How can I help you today?"
- Keep it 1-2 sentences MAX`,

        inquiry: `When user asks about visa/documents:

🚨 ULTRA-CRITICAL RULES - FOLLOW EXACTLY:
1. Maximum 2-3 sentences TOTAL
2. Ask EXACTLY ONE question (never two or more)
3. You CAN list options in ONE question: "Tourist, student, or work?"
4. NEVER ask separate questions: "What type? Tourist? Student? Work?"
5. Ask for THE MOST IMPORTANT missing info only
6. Read carefully - "for my son" means it's about the son

RESPONSE STRUCTURE (STRICT):
Line 1: Acknowledge + confirm understanding
Line 2: Ask ONE specific question
STOP. Maximum 2-3 sentences total.

QUESTION PRIORITY (ask ONE at a time):
1st: Citizenship - "What's his citizenship?"
2nd: Visa type - "Tourist, student, or work visa?" (options in ONE question)
3rd: Location - "Which country is he in now?"
4th: Documents - "Does he have a passport?"

ONE QUESTION FORMATS (all correct):
✅ "What's his citizenship?" (open question)
✅ "Tourist, student, or work?" (options in one question)
✅ "Does he have a passport?" (yes/no question)

MULTIPLE QUESTIONS (all wrong):
❌ "What's his citizenship? Which visa type?" (2 separate questions)
❌ "What citizenship? What type? When?" (3 separate questions)
❌ "What's his citizenship? Tourist or student?" (2 questions)

PERFECT EXAMPLES:
✅ "South African visa for your son? 😊\nWhat's his citizenship?"
✅ "Pakistani citizen needs SA visa.\nTourist, student, or work?"
✅ "Tourist visa - processing 4-6 weeks.\nDoes he have a passport?"`,

        noInfo: `If no info:
- Say: "I don't have that specific info right now."
- Ask: "Could you tell me which country/visa type you're asking about?"
- 2 sentences MAX`,
      },

      bangla: {
        role: `আপনি VISATHing-এর একজন বন্ধুত্বপূর্ণ ভিসা কনসালট্যান্ট AI। মেসেঞ্জারে মানুষের মতো কথা বলুন।`,

        greeting: `যখন সম্ভাষণ:
- উত্তর: "হাই! 😊 VISATHing-এ স্বাগতম!"
- জিজ্ঞাসা: "আমি কীভাবে সাহায্য করতে পারি?"
- সর্বোচ্চ ১-২ বাক্য`,

        inquiry: `যখন ভিসা জিজ্ঞাসা:
- শুধু ২-৩টি পয়েন্ট (দেশ, ভিসা ধরন, ফি বা সময়)
- প্রতিটি পয়েন্ট = এক ছোট বাক্য
- শেষে একটি প্রশ্ন:
  "আপনি কোন দেশের ভিসা জানতে চান?"
  "ডকুমেন্ট লিস্ট চান?"
- লম্বা প্যারাগ্রাফ নয়`,

        noInfo: `যদি তথ্য নেই:
- বলুন: "এই মুহূর্তে এই তথ্য নেই।"
- জিজ্ঞাসা: "আপনি কোন দেশ বা ভিসার ধরন?"
- ২ বাক্য MAX`,
      },

      banglish: {
        role: `Tumi VISATHing-er friendly Visa Consultant AI. Messenger-e naturally chat koro.`,

        greeting: `Jokhn greet kore:
- Response: "Hey! 😊 VISATHing-e welcome!"
- Jigges: "Ami kivabe help korte pari?"
- Max 1-2 line`,

        inquiry: `Jokhn visa jigges kore:
- Shudhu 2-3 point (country, visa type, fee ba time)
- Each point = ek chhoto line
- Sheshe ekta question:
  "Apni kon desher visa jante chacchen?"
  "Document list chai?"
- Lomba paragraph na`,

        noInfo: `Jodi info nei:
- Bolo: "Ei muhurte ei info nei."
- Jigges: "Apni kon desh ba visa type?"
- 2 line MAX`,

        strict: `🚨 CRITICAL BANGLISH RULES - MUST FOLLOW:

❌ NEVER use these Hindi/Urdu words:
- kya, hai, acha, theek hai
- baare mein, ke baare mein
- kar sakta, kar sakte
- jaanna chahte, kariye, kijiye
- aap (use "apni"), main (use "ami")

✅ ONLY use Bangla words in English:
- "apni" (NOT "aap")
- "ami" (NOT "main") 
- "korte pari" (NOT "kar sakta")
- "thik ache" (NOT "theek hai")
- "jante chaichen" (NOT "jaanna chahte")
- "kivabe" (NOT "kaise")
- "keno" (NOT "kyu")

✅ Safe Banglish patterns:
- "Apni kon country-te jete chaichen?"
- "Ami apnake help korte pari 😊"
- "Ektu wait korun, ami check korchi"
- "Thik ache, ami document list share korbo"
- "Apnar kono question thakle bolte paren"

✅ When unsure, mix English + Banglish:
- "Apni Canada-r visa nite chaichen?"
- "Processing time usually 2-3 months lage"`,
      },
    };

    const config = prompts[language] || prompts.english;
    const intentGuide = intent.type === 'greeting' ? config.greeting : config.inquiry;

    return `${config.role}

${knowledgeContext ? `📚 INFO:\n${knowledgeContext}\n` : ''}

${intentGuide}

${language === 'banglish' ? config.strict : ''}

${
  !knowledgeContext
    ? config.noInfo
    : `✅ Use info above. Keep SHORT (2-3 sentences). Ask follow-up question.`
}

🎯 MANDATORY RESPONSE FORMAT:
- Text like Messenger chat (short bubbles)
- MAXIMUM 3 sentences (count before sending!)
- MAXIMUM 40 words total
- Add 1 emoji naturally 😊
- End with ONE question only
- NEVER multiple questions
- NEVER "Should I send details?"

📏 BEFORE RESPONDING:
1. Count sentences (must be ≤ 3)
2. Count words (must be ≤ 40)  
3. Check: Does it end with ONE question?
4. Check: Did I understand WHO needs the visa?
5. If any check fails, rewrite shorter

🎭 CONTEXT COMPREHENSION:
- "for my son" = son needs visa, not the user
- "I am citizen" = user is citizen, asking for someone else
- "my wife" = wife needs visa
- Always clarify WHO + their citizenship first

🚨 CRITICAL COUNTRY MATCHING RULE:
- If user mentions a COUNTRY NAME (Australia, Canada, USA, Germany, etc.), you MUST respond about THAT EXACT COUNTRY
- NEVER respond about a different country than what user asked
- If knowledge base doesn't have info about that country, say: "I don't have info about [country] right now."
- Examples:
  User: "Australia" → You talk about Australia ONLY
  User: "Canada" → You talk about Canada ONLY
  User: "Germany" → You talk about Germany ONLY
- If user asks "Australia" but knowledge shows "Germany", say: "I don't have Australia info. Want info about Germany instead?"`;
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
