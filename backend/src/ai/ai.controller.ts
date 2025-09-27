import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { OpenAIService } from '../openai/openai.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { LangGraphService } from '../langgraph/langgraph.service';

interface AIProcessRequest {
  message: string;
  context?: any;
}

@Controller('ai')
@UseGuards(JwtGuard)
export class AIController {
  constructor(
    private openaiService: OpenAIService,
    private pineconeService: PineconeService,
    private langgraphService: LangGraphService,
  ) {}

  @Post('chat')
  async chat(@Body() request: AIProcessRequest) {
    try {
      const { message, context } = request;
      
      const response = await this.openaiService.createChatCompletion([
        { role: 'user', content: message }
      ]);

      return {
        success: true,
        response: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('embed')
  async createEmbedding(@Body() request: { text: string }) {
    try {
      const embedding = await this.openaiService.createEmbedding(request.text);
      
      return {
        success: true,
        embedding: embedding.data[0]?.embedding,
        usage: embedding.usage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('workflow')
  async processWorkflow(@Body() request: AIProcessRequest) {
    try {
      const { message, context } = request;
      
      const messages = [{ 
        role: 'user', 
        content: message 
      }];

      const result = await this.langgraphService.processWorkflow({
        messages: messages as any,
        context
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}