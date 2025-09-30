import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../ai-infrastructure/openai/openai.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  ToneAnalysis,
  PriorityAssessment,
  ChurnPrediction,
  AnalyticsResult
} from './interfaces/analytics.interfaces';

@Injectable()
export class AnalyticsAgentService {
  constructor(
    private openaiService: OpenAIService,
    private prismaService: PrismaService,
  ) {}

  async analyzeTone(text: string): Promise<ToneAnalysis> {
    try {
      const response = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: `You are an expert sentiment analysis AI. Analyze the tone and sentiment of the provided text.
                   Return a JSON response with the following structure:
                   {
                     "sentiment": "positive|negative|neutral",
                     "confidence": 0.0-1.0,
                     "emotions": ["emotion1", "emotion2"],
                     "urgency": "low|medium|high"
                   }
                   
                   Consider:
                   - Overall sentiment (positive, negative, neutral)
                   - Confidence level in your assessment
                   - Specific emotions detected (anger, frustration, satisfaction, etc.)
                   - Urgency level based on language used
                   
                   Be precise and objective in your analysis.`
        },
        {
          role: 'user',
          content: `Analyze the tone of this text: "${text}"`
        }
      ]);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(result);
      return {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        emotions: analysis.emotions || [],
        urgency: analysis.urgency
      };
    } catch (error) {
      console.error('Tone analysis error:', error);
      // Fallback to neutral analysis
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
        urgency: 'medium'
      };
    }
  }

  async assessPriority(
    text: string,
    clientId?: number,
    metadata?: any
  ): Promise<PriorityAssessment> {
    try {
      // Get client context if available
      let clientContext = '';
      if (clientId) {
        const client = await this.prismaService.client.findUnique({
          where: { id: clientId },
          include: {
            invoices: {
              where: {
                paid: false,
                dueDate: {
                  lt: new Date()
                }
              },
              take: 5
            }
          }
        });

        if (client) {
          const overdueCount = client.invoices.length;
          clientContext = `Client has ${overdueCount} overdue invoices. `;
        }
      }

      const response = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: `You are a customer service priority assessment AI. Analyze the urgency and importance of customer communications.
                   
                   Return a JSON response with:
                   {
                     "priority": "low|medium|high|critical",
                     "score": 0.0-1.0,
                     "factors": ["factor1", "factor2"],
                     "escalationRequired": boolean
                   }
                   
                   Consider:
                   - Language indicating urgency or frustration
                   - Business impact keywords (legal, cancel, terminate, etc.)
                   - Client history and context
                   - Emotional tone and intensity
                   
                   Priority levels:
                   - low: General inquiries, routine requests
                   - medium: Standard complaints, billing questions
                   - high: Urgent issues, service problems, angry customers
                   - critical: Legal threats, cancellation intent, major service failures`
        },
        {
          role: 'user',
          content: `Assess priority for: "${text}"
                   ${clientContext ? `Client context: ${clientContext}` : ''}
                   ${metadata ? `Additional context: ${JSON.stringify(metadata)}` : ''}`
        }
      ]);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const assessment = JSON.parse(result);
      return {
        priority: assessment.priority,
        score: assessment.score,
        factors: assessment.factors || [],
        escalationRequired: assessment.escalationRequired || false
      };
    } catch (error) {
      console.error('Priority assessment error:', error);
      // Fallback to medium priority
      return {
        priority: 'medium',
        score: 0.5,
        factors: ['Unable to assess'],
        escalationRequired: false
      };
    }
  }

  async calculateChurnProbability(clientId: number): Promise<ChurnPrediction> {
    try {
      // Get comprehensive client data
      const client = await this.prismaService.client.findUnique({
        where: { id: clientId },
        include: {
          invoices: {
            orderBy: { dueDate: 'desc' },
            take: 20
          }
        }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Calculate churn indicators
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      
      // Recent invoices analysis (using dueDate as proxy for recency)
      const recentInvoices = client.invoices.filter(
        invoice => new Date(invoice.dueDate) > sixMonthsAgo
      );

      const overdueInvoices = client.invoices.filter(
        invoice => !invoice.paid && new Date(invoice.dueDate) < now
      );

      const paidInvoices = client.invoices.filter(
        invoice => invoice.paid
      );

      // Calculate metrics
      const overdueRate = client.invoices.length > 0 
        ? overdueInvoices.length / client.invoices.length 
        : 0;

      const paymentRatio = client.invoices.length > 0 
        ? paidInvoices.length / client.invoices.length 
        : 1;

      const recentActivityScore = recentInvoices.length / 6; // invoices per month
      
      // Days since last invoice (using dueDate)
      const lastInvoice = client.invoices[0];
      const daysSinceLastInvoice = lastInvoice 
        ? Math.floor((now.getTime() - new Date(lastInvoice.dueDate).getTime()) / (24 * 60 * 60 * 1000))
        : 365;

      // Calculate churn probability
      let churnScore = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // High overdue rate increases churn risk
      if (overdueRate > 0.3) {
        churnScore += 0.3;
        factors.push(`High overdue rate: ${(overdueRate * 100).toFixed(1)}%`);
        recommendations.push('Address outstanding invoices immediately');
      }

      // Low payment ratio
      if (paymentRatio < 0.7) {
        churnScore += 0.25;
        factors.push(`Low payment ratio: ${(paymentRatio * 100).toFixed(1)}%`);
        recommendations.push('Review payment terms and follow up on collections');
      }

      // Inactivity
      if (daysSinceLastInvoice > 90) {
        churnScore += 0.2;
        factors.push(`No recent activity: ${daysSinceLastInvoice} days since last invoice`);
        recommendations.push('Reach out to re-engage the client');
      }

      // Low recent activity
      if (recentActivityScore < 0.5) {
        churnScore += 0.15;
        factors.push(`Low recent activity: ${recentActivityScore.toFixed(1)} invoices/month`);
        recommendations.push('Identify opportunities to increase engagement');
      }

      // Additional global churn analysis
      const totalClients = await this.prismaService.client.count();
      const activeClients = await this.prismaService.client.count({
        where: {
          invoices: {
            some: {
              dueDate: {
                gte: sixMonthsAgo
              }
            }
          }
        }
      });

      const globalChurnRate = totalClients > 0 
        ? (totalClients - activeClients) / totalClients 
        : 0;

      // Adjust score based on global trends
      if (globalChurnRate > 0.2) {
        churnScore += 0.1;
        factors.push(`High global churn rate: ${(globalChurnRate * 100).toFixed(1)}%`);
      }

      // Cap the score at 1.0
      churnScore = Math.min(churnScore, 1.0);

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (churnScore < 0.3) {
        riskLevel = 'low';
      } else if (churnScore < 0.6) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'high';
      }

      // Add positive factors
      if (paymentRatio > 0.9) {
        factors.push('Excellent payment history');
        recommendations.push('Maintain current service level');
      }

      if (recentActivityScore > 1) {
        factors.push('High recent activity');
        recommendations.push('Consider upselling opportunities');
      }

      return {
        churnProbability: churnScore,
        riskLevel,
        factors,
        recommendations
      };

    } catch (error) {
      console.error('Churn calculation error:', error);
      return {
        churnProbability: 0.5,
        riskLevel: 'medium',
        factors: ['Unable to calculate churn risk'],
        recommendations: ['Manual review required']
      };
    }
  }

  async comprehensiveAnalysis(
    text: string,
    clientId?: number,
    metadata?: any
  ): Promise<AnalyticsResult> {
    try {
      // Run tone and priority analysis in parallel
      const [toneAnalysis, priorityAssessment] = await Promise.all([
        this.analyzeTone(text),
        this.assessPriority(text, clientId, metadata)
      ]);

      // Run churn analysis if client ID is provided
      let churnPrediction: ChurnPrediction | undefined;
      if (clientId) {
        churnPrediction = await this.calculateChurnProbability(clientId);
      }

      return {
        tone: toneAnalysis,
        priority: priorityAssessment,
        churn: churnPrediction
      };
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw new Error('Failed to perform comprehensive analysis');
    }
  }

  // Utility method for batch churn analysis
  async getBatchChurnAnalysis(limit: number = 50): Promise<{
    clientId: number;
    email: string;
    churnPrediction: ChurnPrediction;
  }[]> {
    try {
      const clients = await this.prismaService.client.findMany({
        take: limit,
        orderBy: { id: 'desc' }
      });

      const results = await Promise.all(
        clients.map(async (client) => {
          const churnPrediction = await this.calculateChurnProbability(client.id);
          return {
            clientId: client.id,
            email: client.email,
            churnPrediction
          };
        })
      );

      // Sort by churn probability (highest risk first)
      return results.sort((a, b) => b.churnPrediction.churnProbability - a.churnPrediction.churnProbability);
    } catch (error) {
      console.error('Batch churn analysis error:', error);
      throw new Error('Failed to perform batch churn analysis');
    }
  }
}