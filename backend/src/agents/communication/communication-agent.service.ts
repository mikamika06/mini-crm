import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../ai-infrastructure/openai/openai.service';
import { ResearchAgentService } from '../research/research-agent.service';

@Injectable()
export class CommunicationAgentService {
  constructor(
    private openaiService: OpenAIService,
    private researchAgent: ResearchAgentService,
  ) {}

  async generateResponse(query: string, context?: any): Promise<string> {
    try {
      // Step 1: Get relevant context using research agent
      const researchContext = await this.researchAgent.research({ 
        query, 
        type: 'general',
        limit: 5 
      });
      
      // Step 2: Generate response using OpenAI
      const response = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: `You are a helpful CRM assistant. Use the provided context to generate accurate responses. 
                   Context: ${JSON.stringify(researchContext)}`
        },
        {
          role: 'user',
          content: query
        }
      ]);

      return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Communication agent error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async generateDraft(
    type: 'email' | 'message' | 'response',
    content: string,
    tone: 'professional' | 'friendly' | 'formal' = 'professional'
  ): Promise<string> {
    const toneInstructions = {
      professional: 'Use a professional and courteous tone.',
      friendly: 'Use a warm and friendly tone.',
      formal: 'Use a formal and respectful tone.'
    };

    const response = await this.openaiService.createChatCompletion([
      {
        role: 'system',
        content: `You are drafting a ${type} for a CRM system. ${toneInstructions[tone]} 
                 Keep it concise and actionable.`
      },
      {
        role: 'user',
        content: `Draft a ${type} based on: ${content}`
      }
    ]);

    return response.choices[0]?.message?.content || 'Could not generate draft.';
  }
}