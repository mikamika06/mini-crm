import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async createChatCompletion(messages: any[], model?: string) {
    const completion = await this.openai.chat.completions.create({
      model: model || this.configService.get('OPENAI_MODEL', 'gpt-4'),
      messages,
    });
    return completion;
  }

  async createEmbedding(text: string) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return embedding;
  }

  getClient(): OpenAI {
    return this.openai;
  }
}