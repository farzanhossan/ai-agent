import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ProcessedContent {
  text: string;
  originalFormat: 'text' | 'json' | 'csv' | 'pdf' | 'url' | 'file';
  metadata: Record<string, any>;
  chunks?: string[]; // For large content
  needsChunking: boolean;
}

@Injectable()
export class ContentProcessorService {
  private readonly logger = new Logger(ContentProcessorService.name);

  // Configuration
  private readonly MAX_CHUNK_SIZE = 500; // words
  private readonly CHUNK_OVERLAP = 50; // words

  /**
   * Process any type of content input
   */
  async processContent(input: any, type?: string): Promise<ProcessedContent> {
    this.logger.log(`Processing content of type: ${type || 'auto-detect'}`);

    // Auto-detect type if not provided
    const detectedType = type || this.detectContentType(input);

    switch (detectedType) {
      case 'text':
        return this.processText(input);

      case 'json':
        return this.processJson(input);

      case 'csv':
        return this.processCsv(input);

      case 'file':
        return this.processFile(input);

      case 'url':
        return this.processUrl(input);

      default:
        return this.processText(String(input));
    }
  }

  /**
   * Detect content type
   */
  private detectContentType(input: any): string {
    // Check if it's a file path
    if (typeof input === 'string' && (input.endsWith('.json') || input.endsWith('.csv'))) {
      return 'file';
    }

    // Check if it's a URL
    if (
      typeof input === 'string' &&
      (input.startsWith('http://') || input.startsWith('https://'))
    ) {
      return 'url';
    }

    // Check if it's JSON object
    if (typeof input === 'object' && !Array.isArray(input)) {
      return 'json';
    }

    // Check if it's CSV format
    if (typeof input === 'string' && this.looksLikeCsv(input)) {
      return 'csv';
    }

    // Default to text
    return 'text';
  }

  /**
   * Process plain text
   */
  private processText(text: string): ProcessedContent {
    const cleanedText = this.cleanText(text);
    const wordCount = cleanedText.split(/\s+/).length;
    const needsChunking = wordCount > this.MAX_CHUNK_SIZE;

    return {
      text: cleanedText,
      originalFormat: 'text',
      metadata: {
        wordCount,
        characterCount: cleanedText.length,
      },
      chunks: needsChunking ? this.chunkText(cleanedText) : undefined,
      needsChunking,
    };
  }

  /**
   * Process JSON data
   */
  private processJson(_jsonData: any): ProcessedContent {
    console.log('Processing JSON data', _jsonData);

    let jsonData = _jsonData
      .replace(/:\s*NaN/g, ': null')
      .replace(/:\s*Infinity/g, ': null')
      .replace(/:\s*-Infinity/g, ': null')
      .replace(/:\s*undefined/g, ': null');

    let data = jsonData;

    // If it's a string, parse it
    if (typeof jsonData === 'string') {
      data = JSON.parse(jsonData);
    }

    // Convert JSON to readable text
    const text = this.jsonToText(data);

    return {
      text,
      originalFormat: 'json',
      metadata: {
        originalStructure: 'json',
        keys: Object.keys(data),
      },
      chunks: undefined,
      needsChunking: false,
    };
  }

  /**
   * Process CSV data
   */
  private processCsv(csvData: string): ProcessedContent {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    // Convert each row to text
    const texts = rows.map((row) => this.jsonToText(row));

    return {
      text: texts.join('\n\n'),
      originalFormat: 'csv',
      metadata: {
        rowCount: rows.length,
        columns: headers,
      },
      chunks: texts, // Each row is a chunk
      needsChunking: true,
    };
  }

  /**
   * Process file
   */
  private async processFile(filePath: string): Promise<ProcessedContent> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.json':
        const jsonContent = fs.readFileSync(filePath, 'utf-8');
        return this.processJson(jsonContent);

      case '.csv':
        const csvContent = fs.readFileSync(filePath, 'utf-8');
        return this.processCsv(csvContent);

      case '.txt':
        const txtContent = fs.readFileSync(filePath, 'utf-8');
        return this.processText(txtContent);

      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Process URL (mock - in real app would scrape)
   */
  private async processUrl(url: string): Promise<ProcessedContent> {
    this.logger.warn('URL scraping not implemented - treating as text');

    return {
      text: `Content from URL: ${url}`,
      originalFormat: 'url',
      metadata: {
        url,
        note: 'URL scraping not implemented',
      },
      chunks: undefined,
      needsChunking: false,
    };
  }

  /**
   * Clean text (remove extra whitespace, special chars)
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double
      .trim();
  }

  /**
   * Check if string looks like CSV
   */
  private looksLikeCsv(text: string): boolean {
    const lines = text.split('\n');
    if (lines.length < 2) return false;

    const firstLineCommas = (lines[0].match(/,/g) || []).length;
    const secondLineCommas = (lines[1].match(/,/g) || []).length;

    return firstLineCommas > 0 && firstLineCommas === secondLineCommas;
  }

  /**
   * Chunk large text into smaller pieces
   */
  private chunkText(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    let currentChunk: string[] = [];
    let currentSize = 0;

    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);
      currentSize++;

      if (currentSize >= this.MAX_CHUNK_SIZE) {
        chunks.push(currentChunk.join(' '));

        // Start next chunk with overlap
        currentChunk = currentChunk.slice(-this.CHUNK_OVERLAP);
        currentSize = currentChunk.length;
      }
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    this.logger.log(`Split into ${chunks.length} chunks`);

    return chunks;
  }

  /**
   * Merge chunks back (if needed)
   */
  mergeChunks(chunks: string[]): string {
    return chunks.join('\n\n');
  }

  /**
   * Estimate processing time
   */
  estimateProcessingTime(content: string): number {
    const wordCount = content.split(/\s+/).length;

    // Rough estimates (ms)
    if (wordCount < 100) return 100;
    if (wordCount < 500) return 500;
    if (wordCount < 1000) return 1000;
    return 2000;
  }

  // In content-processor.service.ts
  private jsonToText(obj: any, prefix: string = ''): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const formattedKey = key.replace(/_/g, ' ');

      if (value === null || value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        // FIX: Handle array of objects properly
        if (value.length > 0 && typeof value[0] === 'object') {
          const arrayTexts = value.map((item) => this.jsonToText(item));
          parts.push(`${formattedKey}: ${arrayTexts.join('; ')}`);
        } else {
          parts.push(`${formattedKey}: ${value.join(', ')}`);
        }
      } else if (typeof value === 'object') {
        // Nested object - recurse
        parts.push(this.jsonToText(value, formattedKey));
      } else {
        parts.push(`${formattedKey}: ${value}`);
      }
    }

    return parts.join('. ');
  }
}
