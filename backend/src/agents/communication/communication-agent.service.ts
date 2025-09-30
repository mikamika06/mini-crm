import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../ai-infrastructure/openai/openai.service';
import { ResearchAgentService } from '../research/research-agent.service';
import { AnalyticsAgentService } from '../analytics/analytics-agent.service';
import {
  CommunicationResponse,
  DraftRequest,
  DraftResponse,
  AnalyticsEnhancedResponse,
  WorkflowStep
} from './interfaces/communication.interfaces';
import {
  ToneAnalysis,
  PriorityAssessment,
  ChurnPrediction,
  AnalyticsResult
} from '../analytics/interfaces/analytics.interfaces';

@Injectable()
export class CommunicationAgentService {
  constructor(
    private openaiService: OpenAIService,
    private researchAgent: ResearchAgentService,
    private analyticsAgent: AnalyticsAgentService,
  ) {}

  async generateResponse(query: string, context?: any): Promise<CommunicationResponse> {
    try {
      const researchContext = await this.researchAgent.research({ 
        query, 
        type: 'general',
        limit: 5 
      });
      
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

      const generatedText = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      return {
        response: generatedText,
        tone: 'professional',
        metadata: {
          confidence: researchContext.confidence,
          processingTime: researchContext.processingTime,
          sourceType: 'generated'
        }
      };
    } catch (error) {
      console.error('Communication agent error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async generateDraft(request: DraftRequest): Promise<DraftResponse> {
    const { type, content, tone = 'professional', clientId, customInstructions } = request;
    
    const toneInstructions = {
      professional: 'Use a professional and courteous tone.',
      friendly: 'Use a warm and friendly tone.',
      formal: 'Use a formal and respectful tone.'
    };

    let prompt = `You are drafting a ${type} for a CRM system. ${toneInstructions[tone]} Keep it concise and actionable.`;
    
    if (customInstructions) {
      prompt += ` Additional instructions: ${customInstructions}`;
    }

    const response = await this.openaiService.createChatCompletion([
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: `Draft a ${type} based on: ${content}`
      }
    ]);

    const draft = response.choices[0]?.message?.content || 'Could not generate draft.';
    const wordCount = draft.split(' ').length;
    
    return {
      draft,
      suggestedTone: tone,
      metadata: {
        wordCount,
        estimatedReadTime: Math.ceil(wordCount / 200),
        formalityScore: this.calculateFormalityScore(draft)
      }
    };
  }

  async generateAnalyticsEnhancedResponse(
    query: string, 
    clientId?: number, 
    context?: any
  ): Promise<AnalyticsEnhancedResponse> {
    try {
      const analytics = await this.analyticsAgent.comprehensiveAnalysis(
        query,
        clientId,
        context
      );

      const researchContext = await this.researchAgent.research({ 
        query, 
        type: 'general',
        limit: 5 
      });

      let recommendedTone = 'professional';
      if (analytics.tone.sentiment === 'negative' || analytics.priority.priority === 'high') {
        recommendedTone = 'formal';
      } else if (analytics.tone.sentiment === 'positive') {
        recommendedTone = 'friendly';
      }

      const analyticsContext = `
        Tone Analysis: ${analytics.tone.sentiment} sentiment (${analytics.tone.urgency} urgency)
        Priority: ${analytics.priority.priority} priority (${analytics.priority.escalationRequired ? 'requires escalation' : 'no escalation needed'})
        ${analytics.churn ? `Churn Risk: ${analytics.churn.riskLevel} (${(analytics.churn.churnProbability * 100).toFixed(1)}%)` : ''}
        Key Factors: ${analytics.priority.factors.join(', ')}
      `;

      const response = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: `You are a CRM assistant with advanced analytics capabilities. 
                   
                   Research Context: ${JSON.stringify(researchContext)}
                   
                   Analytics Context: ${analyticsContext}
                   
                   Based on the analytics, respond appropriately:
                   - Use ${recommendedTone} tone
                   - ${analytics.priority.escalationRequired ? 'Mark this as requiring escalation' : 'Handle as standard inquiry'}
                   - ${analytics.churn && analytics.churn.riskLevel === 'high' ? 'Be extra attentive as this client has high churn risk' : ''}
                   - Consider the emotional state: ${analytics.tone.emotions.join(', ')}
                   
                   Provide helpful recommendations if needed.`
        },
        {
          role: 'user',
          content: query
        }
      ]);

      return {
        response: response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.',
        analytics: {
          tone: analytics.tone,
          priority: analytics.priority,
          churn: analytics.churn
        },
        recommendedActions: this.generateActionItems(analytics),
        escalationRequired: analytics.priority.escalationRequired
      };
    } catch (error) {
      console.error('Analytics-enhanced response error:', error);
      throw new Error('Failed to generate analytics-enhanced response');
    }
  }

  async generateSmartDraft(
    type: 'email' | 'message' | 'response',
    content: string,
    clientId?: number,
    customTone?: 'professional' | 'friendly' | 'formal'
  ): Promise<{
    draft: string;
    analytics: AnalyticsResult;
    recommendedActions: string[];
  }> {
    try {
      const analytics = await this.analyticsAgent.comprehensiveAnalysis(
        content,
        clientId
      );

      let finalTone = customTone;
      if (!finalTone) {
        if (analytics.tone.sentiment === 'negative' || analytics.priority.priority === 'critical') {
          finalTone = 'formal';
        } else if (analytics.tone.sentiment === 'positive') {
          finalTone = 'friendly';
        } else {
          finalTone = 'professional';
        }
      }

      const toneInstructions = {
        professional: 'Use a professional and courteous tone.',
        friendly: 'Use a warm and friendly tone.',
        formal: 'Use a formal and respectful tone.'
      };

      const analyticsContext = `
        Original message tone: ${analytics.tone.sentiment} (${analytics.tone.urgency} urgency)
        Priority level: ${analytics.priority.priority}
        ${analytics.churn ? `Client churn risk: ${analytics.churn.riskLevel}` : ''}
        Emotions detected: ${analytics.tone.emotions.join(', ')}
      `;

      const response = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: `You are drafting a ${type} for a CRM system. ${toneInstructions[finalTone]}
                   
                   Analytics Context: ${analyticsContext}
                   
                   ${analytics.priority.escalationRequired ? 'This requires escalation - mention follow-up by supervisor.' : ''}
                   ${analytics.churn && analytics.churn.riskLevel === 'high' ? 'This client has high churn risk - be extra accommodating.' : ''}
                   
                   Keep it concise, actionable, and address the emotional context appropriately.`
        },
        {
          role: 'user',
          content: `Draft a ${type} based on: ${content}`
        }
      ]);

      const recommendedActions: string[] = [];
      
      if (analytics.priority.escalationRequired) {
        recommendedActions.push('Escalate to supervisor immediately');
      }
      
      if (analytics.churn && analytics.churn.riskLevel === 'high') {
        recommendedActions.push('Schedule retention call within 48 hours');
        recommendedActions.push('Review account for upselling opportunities');
      }
      
      if (analytics.tone.sentiment === 'negative') {
        recommendedActions.push('Follow up within 24 hours to ensure satisfaction');
      }
      
      analytics.churn?.recommendations.forEach(rec => {
        recommendedActions.push(rec);
      });

      return {
        draft: response.choices[0]?.message?.content || 'Could not generate draft.',
        analytics,
        recommendedActions
      };
    } catch (error) {
      console.error('Smart draft generation error:', error);
      throw new Error('Failed to generate smart draft');
    }
  }

  private calculateFormalityScore(text: string): number {
    const formalWords = ['please', 'kindly', 'respectfully', 'sincerely', 'therefore', 'furthermore'];
    const casualWords = ['hey', 'hi', 'thanks', 'cool', 'awesome', 'yeah'];
    
    const words = text.toLowerCase().split(/\s+/);
    const formalCount = words.filter(word => formalWords.includes(word)).length;
    const casualCount = words.filter(word => casualWords.includes(word)).length;
    
    const totalIndicators = formalCount + casualCount;
    if (totalIndicators === 0) return 0.5; 
    
    return formalCount / totalIndicators;
  }

  private generateActionItems(analytics: AnalyticsResult): string[] {
    const actions: string[] = [];

    if (analytics.priority.escalationRequired) {
      actions.push('Escalate to senior team member');
    }

    if (analytics.churn && analytics.churn.riskLevel === 'high') {
      actions.push('Schedule retention call');
      actions.push('Offer loyalty benefits');
    }

    if (analytics.tone.sentiment === 'negative') {
      actions.push('Follow up within 24 hours');
      actions.push('Document customer concern');
    }

    if (analytics.priority.priority === 'high') {
      actions.push('Set urgent flag');
    }

    return actions;
  }
}