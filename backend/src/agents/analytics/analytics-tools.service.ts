import { Injectable } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';
import {
  ToneAnalysis,
  PriorityAssessment,
  ChurnPrediction,
  AnalyzeToneInput,
  AssessPriorityInput,
  ChurnAnalysisInput,
  ComprehensiveAnalysisInput,
  AnalyticsToolResponse,
  BatchChurnAnalysisResult
} from './interfaces/analytics.interfaces';

@Injectable()
export class AnalyticsToolsService {
  constructor(private analyticsService: AnalyticsAgentService) {}

  // LangGraph tool for tone analysis
  async analyzeToneTool(input: AnalyzeToneInput): Promise<AnalyticsToolResponse<ToneAnalysis>> {
    try {
      const result = await this.analyticsService.analyzeTone(input.text);
      
      return {
        result,
        description: `Tone analysis completed: ${result.sentiment} sentiment with ${(result.confidence * 100).toFixed(1)}% confidence. Urgency level: ${result.urgency}. Detected emotions: ${result.emotions.join(', ')}.`
      };
    } catch (error) {
      throw new Error(`Tone analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // LangGraph tool for priority assessment
  async assessPriorityTool(input: AssessPriorityInput): Promise<AnalyticsToolResponse<PriorityAssessment>> {
    try {
      const result = await this.analyticsService.assessPriority(
        input.text,
        input.clientId,
        input.metadata
      );
      
      return {
        result,
        description: `Priority assessment completed: ${result.priority} priority with score ${(result.score * 100).toFixed(1)}%. ${result.escalationRequired ? 'Escalation required!' : 'No escalation needed.'} Key factors: ${result.factors.join(', ')}.`
      };
    } catch (error) {
      throw new Error(`Priority assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // LangGraph tool for churn prediction
  async churnAnalysisTool(input: ChurnAnalysisInput): Promise<AnalyticsToolResponse<ChurnPrediction>> {
    try {
      const result = await this.analyticsService.calculateChurnProbability(input.clientId);
      
      return {
        result,
        description: `Churn analysis completed: ${(result.churnProbability * 100).toFixed(1)}% churn probability, ${result.riskLevel} risk level. Key factors: ${result.factors.join(', ')}. Recommendations: ${result.recommendations.join(', ')}.`
      };
    } catch (error) {
      throw new Error(`Churn analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // LangGraph tool for comprehensive analysis
  async comprehensiveAnalysisTool(input: ComprehensiveAnalysisInput): Promise<AnalyticsToolResponse<{
    tone: ToneAnalysis;
    priority: PriorityAssessment;
    churn?: ChurnPrediction;
  }>> {
    try {
      const result = await this.analyticsService.comprehensiveAnalysis(
        input.text,
        input.clientId,
        input.metadata
      );
      
      let description = `Comprehensive analysis completed:\n`;
      description += `- Tone: ${result.tone.sentiment} (${(result.tone.confidence * 100).toFixed(1)}% confidence, ${result.tone.urgency} urgency)\n`;
      description += `- Priority: ${result.priority.priority} (score: ${(result.priority.score * 100).toFixed(1)}%)`;
      
      if (result.churn) {
        description += `\n- Churn Risk: ${(result.churn.churnProbability * 100).toFixed(1)}% (${result.churn.riskLevel} risk)`;
      }
      
      if (result.priority.escalationRequired) {
        description += `\n⚠️ ESCALATION REQUIRED!`;
      }
      
      return {
        result,
        description
      };
    } catch (error) {
      throw new Error(`Comprehensive analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // LangGraph tool for batch churn analysis
  async batchChurnAnalysisTool(limit: number = 50): Promise<AnalyticsToolResponse<BatchChurnAnalysisResult[]>> {
    try {
      const result = await this.analyticsService.getBatchChurnAnalysis(limit);
      
      const highRiskClients = result.filter(r => r.churnPrediction.riskLevel === 'high').length;
      const mediumRiskClients = result.filter(r => r.churnPrediction.riskLevel === 'medium').length;
      const lowRiskClients = result.filter(r => r.churnPrediction.riskLevel === 'low').length;
      
      const description = `Batch churn analysis completed for ${result.length} clients: ${highRiskClients} high risk, ${mediumRiskClients} medium risk, ${lowRiskClients} low risk. Top 3 highest risk clients: ${result.slice(0, 3).map(r => `${r.email} (${(r.churnPrediction.churnProbability * 100).toFixed(1)}%)`).join(', ')}.`;
      
      return {
        result,
        description
      };
    } catch (error) {
      throw new Error(`Batch churn analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to get all available tools for LangGraph
  getAvailableTools(): any[] {
    return [
      {
        name: 'analyze_tone',
        description: 'Analyze the tone and sentiment of a text message. Returns sentiment, confidence, emotions, and urgency level.',
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text to analyze for tone and sentiment'
            }
          },
          required: ['text']
        },
        function: this.analyzeToneTool.bind(this)
      },
      {
        name: 'assess_priority',
        description: 'Assess the priority level of a customer communication. Returns priority level, score, factors, and escalation requirements.',
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text to analyze for priority assessment'
            },
            clientId: {
              type: 'number',
              description: 'Optional client ID for additional context'
            },
            metadata: {
              type: 'object',
              description: 'Optional additional metadata for context'
            }
          },
          required: ['text']
        },
        function: this.assessPriorityTool.bind(this)
      },
      {
        name: 'analyze_churn_risk',
        description: 'Calculate churn probability for a specific client based on historical data. Returns churn probability, risk level, factors, and recommendations.',
        schema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'The client ID to analyze for churn risk'
            }
          },
          required: ['clientId']
        },
        function: this.churnAnalysisTool.bind(this)
      },
      {
        name: 'comprehensive_analysis',
        description: 'Perform comprehensive analysis including tone, priority, and churn risk (if client ID provided). Returns all analytics in one call.',
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text to analyze'
            },
            clientId: {
              type: 'number',
              description: 'Optional client ID for churn analysis and additional context'
            },
            metadata: {
              type: 'object',
              description: 'Optional additional metadata for context'
            }
          },
          required: ['text']
        },
        function: this.comprehensiveAnalysisTool.bind(this)
      },
      {
        name: 'batch_churn_analysis',
        description: 'Perform churn analysis for multiple clients and return them sorted by risk level. Useful for identifying clients at risk.',
        schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of clients to analyze (default: 50)'
            }
          }
        },
        function: this.batchChurnAnalysisTool.bind(this)
      }
    ];
  }
}