import { Injectable } from '@nestjs/common';
import { CoordinatorAgentService } from './coordinator-agent.service';
import {
  CoordinatorRequest,
  CoordinatorResponse,
  AnalyticsCoordinationRequest,
  ResearchCoordinationRequest,
  CommunicationCoordinationRequest,
  AgentHealthStatus,
  CoordinatorHealthResponse
} from './interfaces/coordinator.interfaces';

export interface CoordinatorToolResponse<T> {
  result: T;
  description: string;
}

@Injectable()
export class CoordinatorToolsService {
  constructor(private coordinatorService: CoordinatorAgentService) {}

  /**
   * LangGraph tool for general coordination
   */
  async coordinateTool(input: CoordinatorRequest): Promise<CoordinatorToolResponse<CoordinatorResponse>> {
    try {
      const result = await this.coordinatorService.coordinate(input);
      
      return {
        result,
        description: `Coordination completed: ${result.strategy} strategy executed with ${result.agentResults.length} agents. ` +
                    `Overall confidence: ${(result.confidence * 100).toFixed(1)}%. ` +
                    `Processing time: ${result.processingTime}ms.`
      };
    } catch (error) {
      throw new Error(`Coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * LangGraph tool for analytics-focused coordination
   */
  async analyticsCoordinationTool(input: AnalyticsCoordinationRequest): Promise<CoordinatorToolResponse<CoordinatorResponse>> {
    try {
      const result = await this.coordinatorService.coordinate(input);
      
      const analyticsResult = result.agentResults.find(r => r.agent === 'analytics' && r.success);
      let analyticsInfo = 'Analytics data processed';
      
      if (analyticsResult?.result) {
        const { tone, priority, churn } = analyticsResult.result;
        analyticsInfo = `Sentiment: ${tone.sentiment} (${(tone.confidence * 100).toFixed(1)}% confidence), ` +
                       `Priority: ${priority.priority}` +
                       (churn ? `, Churn Risk: ${churn.riskLevel} (${(churn.churnProbability * 100).toFixed(1)}%)` : '');
      }
      
      return {
        result,
        description: `Analytics coordination completed. ${analyticsInfo}. ` +
                    `Total processing time: ${result.processingTime}ms.`
      };
    } catch (error) {
      throw new Error(`Analytics coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * LangGraph tool for research-focused coordination
   */
  async researchCoordinationTool(input: ResearchCoordinationRequest): Promise<CoordinatorToolResponse<CoordinatorResponse>> {
    try {
      const result = await this.coordinatorService.coordinate(input);
      
      const researchResult = result.agentResults.find(r => r.agent === 'research' && r.success);
      let researchInfo = 'Research data processed';
      
      if (researchResult?.result) {
        const { totalResults, confidence } = researchResult.result;
        researchInfo = `Found ${totalResults} results with ${(confidence * 100).toFixed(1)}% confidence`;
      }
      
      return {
        result,
        description: `Research coordination completed. ${researchInfo}. ` +
                    `Total processing time: ${result.processingTime}ms.`
      };
    } catch (error) {
      throw new Error(`Research coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * LangGraph tool for communication-focused coordination
   */
  async communicationCoordinationTool(input: CommunicationCoordinationRequest): Promise<CoordinatorToolResponse<CoordinatorResponse>> {
    try {
      const result = await this.coordinatorService.coordinate(input);
      
      const communicationResult = result.agentResults.find(r => r.agent === 'communication' && r.success);
      let communicationInfo = 'Response generated';
      
      if (communicationResult?.result?.response) {
        const responseLength = communicationResult.result.response.length;
        communicationInfo = `Generated response (${responseLength} characters)`;
      }
      
      return {
        result,
        description: `Communication coordination completed. ${communicationInfo}. ` +
                    `Total processing time: ${result.processingTime}ms.`
      };
    } catch (error) {
      throw new Error(`Communication coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * LangGraph tool for health check coordination
   */
  async healthCheckTool(): Promise<CoordinatorToolResponse<CoordinatorHealthResponse>> {
    try {
      const startTime = Date.now();
      const healthData = await this.coordinatorService.healthCheck();
      const processingTime = Date.now() - startTime;
      
      const agentHealthStatuses: AgentHealthStatus[] = Object.entries(healthData.agents).map(([agent, status]) => ({
        agent: agent as any,
        status: status as any,
        lastCheck: new Date().toISOString(),
        responseTime: processingTime / 3 // Approximate per agent
      }));
      
      const result: CoordinatorHealthResponse = {
        status: healthData.status as any,
        agents: agentHealthStatuses,
        overallResponseTime: processingTime,
        timestamp: new Date().toISOString()
      };
      
      return {
        result,
        description: `Health check completed. Overall status: ${result.status}. ` +
                    `Checked ${result.agents.length} agents in ${processingTime}ms.`
      };
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all available coordination tools for LangGraph registration
   */
  getAvailableTools() {
    return {
      coordinate: {
        name: 'coordinate',
        description: 'Orchestrate multiple agents (research, analytics, communication) to provide comprehensive responses',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The user query to process'
            },
            context: {
              type: 'object',
              properties: {
                clientId: {
                  type: 'number',
                  description: 'Optional client ID for context'
                },
                searchType: {
                  type: 'string',
                  enum: ['general', 'client', 'invoice', 'analytics'],
                  description: 'Type of search to perform'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'urgent'],
                  description: 'Priority level of the request'
                }
              }
            }
          },
          required: ['query']
        }
      },
      
      analyticsCoordination: {
        name: 'analyticsCoordination',
        description: 'Coordinate agents with focus on analytics (sentiment, priority, churn prediction)',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The user query to analyze'
            },
            context: {
              type: 'object',
              properties: {
                clientId: {
                  type: 'number',
                  description: 'Client ID for churn analysis (required for analytics)'
                },
                includeChurnAnalysis: {
                  type: 'boolean',
                  description: 'Whether to include churn prediction'
                },
                includeToneAnalysis: {
                  type: 'boolean',
                  description: 'Whether to include tone analysis'
                },
                includePriorityAssessment: {
                  type: 'boolean',
                  description: 'Whether to include priority assessment'
                }
              },
              required: ['clientId']
            }
          },
          required: ['query', 'context']
        }
      },
      
      researchCoordination: {
        name: 'researchCoordination',
        description: 'Coordinate agents with focus on research and information gathering',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The user query to research'
            },
            context: {
              type: 'object',
              properties: {
                searchType: {
                  type: 'string',
                  enum: ['general', 'client', 'invoice', 'analytics'],
                  description: 'Type of search to perform'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return'
                },
                includeVectorSearch: {
                  type: 'boolean',
                  description: 'Whether to include vector search'
                },
                includeDatabaseSearch: {
                  type: 'boolean',
                  description: 'Whether to include database search'
                }
              },
              required: ['searchType', 'limit']
            }
          },
          required: ['query', 'context']
        }
      },
      
      communicationCoordination: {
        name: 'communicationCoordination',
        description: 'Coordinate agents with focus on communication and response generation',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The user query to respond to'
            },
            context: {
              type: 'object',
              properties: {
                tone: {
                  type: 'string',
                  enum: ['professional', 'friendly', 'urgent', 'casual'],
                  description: 'Desired tone for the response'
                },
                template: {
                  type: 'string',
                  description: 'Optional response template'
                },
                includeAnalytics: {
                  type: 'boolean',
                  description: 'Whether to include analytics data'
                },
                includeResearch: {
                  type: 'boolean',
                  description: 'Whether to include research data'
                }
              }
            }
          },
          required: ['query']
        }
      },
      
      healthCheck: {
        name: 'healthCheck',
        description: 'Check health status of all coordination agents',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    };
  }

  /**
   * Get tool execution statistics
   */
  async getToolStats() {
    return {
      availableTools: Object.keys(this.getAvailableTools()).length,
      lastHealthCheck: new Date().toISOString(),
      coordinator: {
        status: 'active',
        supportedAgents: ['research', 'analytics', 'communication'],
        supportedStrategies: ['analytics-first', 'research-first', 'communication-focused']
      }
    };
  }
}