import { Injectable } from '@nestjs/common';
import { ResearchAgentService } from '../research/research-agent.service';
import { CommunicationAgentService } from '../communication/communication-agent.service';
import { AnalyticsAgentService } from '../analytics/analytics-agent.service';
import { DatabaseAnalyticsService } from '../analytics/database-analytics.service';
import {
  CoordinatorRequest,
  CoordinatorResponse,
  WorkflowState,
  AgentExecutionResult,
  WorkflowStep,
  AgentType,
  CoordinationStrategy
} from './interfaces/coordinator.interfaces';
import {
  SearchContext,
  ResearchResult
} from '../research/interfaces/research.interfaces';
import {
  CommunicationResponse
} from '../communication/interfaces/communication.interfaces';
import {
  AnalyticsResult,
  ToneAnalysis,
  ChurnPrediction
} from '../analytics/interfaces/analytics.interfaces';

@Injectable()
export class CoordinatorAgentService {
  constructor(
    private researchAgent: ResearchAgentService,
    private communicationAgent: CommunicationAgentService,
    private analyticsAgent: AnalyticsAgentService,
    private databaseAnalytics: DatabaseAnalyticsService,
  ) {}

  /**
   * Main orchestration method - coordinates all agents based on LangGraph workflow
   */
  async coordinate(request: CoordinatorRequest): Promise<CoordinatorResponse> {
    const startTime = Date.now();
    const workflowId = this.generateWorkflowId();
    
    try {
      // Step 1: Analyze query and determine strategy
      const strategy = await this.analyzeQuery(request);
      
      // Step 2: Execute workflow based on strategy
      const workflowResult = await this.executeWorkflow(strategy, request);
      
      // Step 3: Synthesize final response
      const finalResponse = await this.synthesizeResponse(workflowResult, request);
      
      const processingTime = Date.now() - startTime;
      
      return {
        response: finalResponse,
        workflowId,
        strategy: strategy.type,
        executedSteps: workflowResult.executedSteps,
        agentResults: workflowResult.agentResults,
        processingTime,
        confidence: this.calculateOverallConfidence(workflowResult.agentResults),
        metadata: {
          timestamp: new Date().toISOString(),
          totalAgentsUsed: workflowResult.agentResults.length,
          workflowSuccess: true
        }
      };
    } catch (error) {
      console.error('Coordination error:', error);
      return this.createErrorResponse(workflowId, error, Date.now() - startTime);
    }
  }

  /**
   * Analyze incoming query to determine which agents to use and in what order
   */
  private async analyzeQuery(request: CoordinatorRequest): Promise<CoordinationStrategy> {
    const { query, context } = request;
    
    // Use analytics to understand the tone and priority of the request
    const toneAnalysis = await this.analyticsAgent.analyzeTone(query);
    
    // Determine strategy based on query analysis
    if (this.isAnalyticsQuery(query)) {
      return {
        type: 'analytics-first',
        requiredAgents: ['analytics', 'research', 'communication'],
        priority: toneAnalysis.urgency,
        reasoning: 'Query requires data analysis and statistical insights'
      };
    } else if (this.isResearchQuery(query)) {
      return {
        type: 'research-first',
        requiredAgents: ['research', 'analytics', 'communication'],
        priority: toneAnalysis.urgency,
        reasoning: 'Query requires information gathering and context building'
      };
    } else {
      return {
        type: 'communication-focused',
        requiredAgents: ['research', 'communication'],
        priority: toneAnalysis.urgency,
        reasoning: 'Query is conversational and requires response generation'
      };
    }
  }

  /**
   * Execute the LangGraph workflow based on determined strategy
   */
  private async executeWorkflow(
    strategy: CoordinationStrategy, 
    request: CoordinatorRequest
  ): Promise<WorkflowState> {
    const agentResults: AgentExecutionResult[] = [];
    const executedSteps: WorkflowStep[] = [];
    
    for (const agentType of strategy.requiredAgents) {
      const stepStart = Date.now();
      
      try {
        let result: any;
        
        switch (agentType) {
          case 'research':
            result = await this.executeResearchAgent(request, agentResults);
            break;
          case 'analytics':
            result = await this.executeAnalyticsAgent(request, agentResults);
            break;
          case 'communication':
            result = await this.executeCommunicationAgent(request, agentResults);
            break;
        }
        
        const stepTime = Date.now() - stepStart;
        
        agentResults.push({
          agent: agentType,
          result,
          success: true,
          processingTime: stepTime,
          timestamp: new Date().toISOString()
        });
        
        executedSteps.push({
          step: agentType,
          status: 'completed',
          duration: stepTime,
          output: this.summarizeOutput(result)
        });
        
      } catch (error) {
        console.error(`Agent ${agentType} execution failed:`, error);
        
        agentResults.push({
          agent: agentType,
          result: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - stepStart,
          timestamp: new Date().toISOString()
        });
        
        executedSteps.push({
          step: agentType,
          status: 'failed',
          duration: Date.now() - stepStart,
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return {
      workflowId: this.generateWorkflowId(),
      currentStep: 'completed',
      agentResults,
      executedSteps,
      isComplete: true
    };
  }

  /**
   * Execute Research Agent
   */
  private async executeResearchAgent(
    request: CoordinatorRequest, 
    previousResults: AgentExecutionResult[]
  ): Promise<ResearchResult> {
    const searchContext: SearchContext = {
      query: request.query,
      type: request.context?.searchType === 'analytics' ? 'general' : (request.context?.searchType || 'general'),
      limit: request.context?.limit || 10
    };
    
    return await this.researchAgent.research(searchContext);
  }

  /**
   * Execute Analytics Agent
   */
  private async executeAnalyticsAgent(
    request: CoordinatorRequest, 
    previousResults: AgentExecutionResult[]
  ): Promise<AnalyticsResult> {
    // Use comprehensive analysis that includes tone, priority, and churn prediction
    return await this.analyticsAgent.comprehensiveAnalysis(
      request.query,
      request.context?.clientId,
      request.context?.metadata
    );
  }

  /**
   * Execute Communication Agent
   */
  private async executeCommunicationAgent(
    request: CoordinatorRequest, 
    previousResults: AgentExecutionResult[]
  ): Promise<CommunicationResponse> {
    // Gather context from previous agent results
    const enrichedContext = this.buildEnrichedContext(previousResults, request.context);
    
    return await this.communicationAgent.generateResponse(request.query, enrichedContext);
  }

  /**
   * Synthesize final response from all agent results
   */
  private async synthesizeResponse(
    workflowResult: WorkflowState, 
    request: CoordinatorRequest
  ): Promise<string> {
    const successfulResults = workflowResult.agentResults.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return 'I apologize, but I was unable to process your request due to technical issues. Please try again.';
    }
    
    // Find communication agent result first
    const communicationResult = successfulResults.find(r => r.agent === 'communication');
    if (communicationResult?.result?.response) {
      return communicationResult.result.response;
    }
    
    // Fallback: synthesize from available results
    const researchResult = successfulResults.find(r => r.agent === 'research');
    const analyticsResult = successfulResults.find(r => r.agent === 'analytics');
    
    let synthesis = `Based on my analysis:\n\n`;
    
    if (analyticsResult?.result) {
      const analytics = analyticsResult.result as AnalyticsResult;
      synthesis += `Analytics: ${analytics.tone.sentiment} sentiment detected with ${analytics.priority.priority} priority.\n`;
      
      if (analytics.churn) {
        synthesis += `Churn Risk: ${(analytics.churn.churnProbability * 100).toFixed(1)}% - ${analytics.churn.riskLevel}\n`;
      }
    }
    
    if (researchResult?.result) {
      const research = researchResult.result as ResearchResult;
      synthesis += `\nResearch Summary: ${research.summary}\n`;
      synthesis += `Found ${research.totalResults} relevant results with ${(research.confidence * 100).toFixed(1)}% confidence.\n`;
    }
    
    return synthesis;
  }

  /**
   * Helper methods
   */
  private isAnalyticsQuery(query: string): boolean {
    const analyticsKeywords = [
      'analytics', 'analysis', 'churn', 'predict', 'probability', 'risk',
      'statistics', 'data', 'metrics', 'performance', 'trends', 'sentiment'
    ];
    const lowerQuery = query.toLowerCase();
    return analyticsKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private isResearchQuery(query: string): boolean {
    const researchKeywords = [
      'search', 'find', 'look up', 'information', 'details', 'history',
      'background', 'context', 'research', 'investigate', 'discover'
    ];
    const lowerQuery = query.toLowerCase();
    return researchKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private buildEnrichedContext(results: AgentExecutionResult[], originalContext?: any): any {
    const context = { ...originalContext };
    
    results.forEach(result => {
      if (result.success && result.result) {
        context[`${result.agent}Data`] = result.result;
      }
    });
    
    return context;
  }

  private calculateOverallConfidence(results: AgentExecutionResult[]): number {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;
    
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    successfulResults.forEach(result => {
      if (result.result?.confidence) {
        totalConfidence += result.result.confidence;
        confidenceCount++;
      }
    });
    
    return confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5;
  }

  private summarizeOutput(result: any): string {
    if (!result) return 'No output';
    
    if (result.response) return `Response generated: ${result.response.substring(0, 100)}...`;
    if (result.summary) return `Summary: ${result.summary.substring(0, 100)}...`;
    if (result.toneAnalysis) return `Tone: ${result.toneAnalysis.sentiment}`;
    
    return 'Output processed successfully';
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createErrorResponse(
    workflowId: string, 
    error: any, 
    processingTime: number
  ): CoordinatorResponse {
    return {
      response: 'I apologize, but I encountered an error while processing your request. Please try again.',
      workflowId,
      strategy: 'error',
      executedSteps: [],
      agentResults: [],
      processingTime,
      confidence: 0,
      metadata: {
        timestamp: new Date().toISOString(),
        totalAgentsUsed: 0,
        workflowSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }

  /**
   * Health check for coordinator
   */
  async healthCheck(): Promise<{ status: string; agents: any }> {
    const agentHealth = {
      research: 'unknown',
      communication: 'unknown',
      analytics: 'unknown'
    };

    try {
      // Test each agent with simple operations
      await this.researchAgent.research({ query: 'test', type: 'general', limit: 1 });
      agentHealth.research = 'healthy';
    } catch (error) {
      agentHealth.research = 'error';
    }

    try {
      await this.communicationAgent.generateResponse('test');
      agentHealth.communication = 'healthy';
    } catch (error) {
      agentHealth.communication = 'error';
    }

    try {
      await this.analyticsAgent.analyzeTone('test');
      agentHealth.analytics = 'healthy';
    } catch (error) {
      agentHealth.analytics = 'error';
    }

    const allHealthy = Object.values(agentHealth).every(status => status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      agents: agentHealth
    };
  }
}