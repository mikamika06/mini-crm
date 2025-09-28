import { Injectable } from '@nestjs/common';
import { ResearchAgentService } from '../research/research-agent.service';
import { OpenAIService } from '../../ai-infrastructure/openai/openai.service';

interface WorkflowState {
  query: string;
  thought?: string;
  action?: string;
  observation?: string;
  context?: any;
  response?: string;
  steps: Array<{
    type: 'thought' | 'action' | 'observation';
    content: string;
    timestamp: Date;
  }>;
  isComplete: boolean;
}

interface WorkflowConfig {
  maxSteps?: number;
  tone?: string;
  type?: string;
  language?: string;
}

@Injectable()
export class ReactWorkflowService {
  constructor(
    private researchAgent: ResearchAgentService,
    private openaiService: OpenAIService,
  ) {}

  async executeReActWorkflow(
    query: string, 
    config: WorkflowConfig = {}
  ): Promise<WorkflowState> {
    const state: WorkflowState = {
      query,
      steps: [],
      isComplete: false,
    };

    const maxSteps = config.maxSteps || 10;
    let currentStep = 0;

    while (!state.isComplete && currentStep < maxSteps) {
      // Determine next action based on current state
      const nextAction = this.determineNextAction(state);
      
      switch (nextAction) {
        case 'THINK':
          await this.thinkStep(state, config);
          break;
        case 'SEARCH':
          await this.searchStep(state);
          break;
        case 'GENERATE':
          await this.generateStep(state, config);
          break;
        case 'COMPLETE':
          state.isComplete = true;
          break;
        default:
          state.isComplete = true;
          break;
      }

      currentStep++;
    }

    return state;
  }

  private determineNextAction(state: WorkflowState): string {
    // If no thought yet, start with thinking
    if (!state.thought) {
      return 'THINK';
    }

    // If thought indicates need for search and no context yet
    if (state.thought.includes('search') || state.thought.includes('context')) {
      if (!state.context) {
        return 'SEARCH';
      }
    }

    // If we have thought and potentially context, generate response
    if (state.thought && !state.response) {
      return 'GENERATE';
    }

    // If we have a response, we're complete
    if (state.response) {
      return 'COMPLETE';
    }

    return 'COMPLETE';
  }

  private async thinkStep(state: WorkflowState, config: WorkflowConfig): Promise<void> {
    const thinkPrompt = `
    Analyze this query and determine what needs to be done:
    
    Query: "${state.query}"
    
    Think through:
    1. What is the user asking for?
    2. Do I need to search for additional information?
    3. What type of response would be most helpful?
    4. Should I search the database or vectors?
    
    Respond with your thinking process and conclude with either:
    - "I need to search for: [what to search]" if you need more info
    - "I can respond directly" if you have enough info
    `;

    try {
      const response = await this.openaiService.createChatCompletion([
        { role: 'system', content: 'You are a thoughtful AI assistant analyzing user queries.' },
        { role: 'user', content: thinkPrompt }
      ]);

      state.thought = response.choices[0]?.message?.content || 'Unable to think';
      
      state.steps.push({
        type: 'thought',
        content: state.thought,
        timestamp: new Date(),
      });
    } catch (error) {
      state.thought = 'Error in thinking step';
      state.steps.push({
        type: 'thought',
        content: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date(),
      });
    }
  }

  private async searchStep(state: WorkflowState): Promise<void> {
    try {
      // Use research agent to gather context
      const searchResult = await this.researchAgent.research({
        query: state.query,
        limit: 5,
      });

      state.context = searchResult;
      state.observation = `Found ${searchResult.databaseResults.length} database results and ${searchResult.vectorResults.length} vector results. ${searchResult.summary}`;
      
      state.steps.push({
        type: 'action',
        content: 'SEARCH_FOR_CONTEXT',
        timestamp: new Date(),
      });

      state.steps.push({
        type: 'observation',
        content: state.observation,
        timestamp: new Date(),
      });
    } catch (error) {
      state.observation = 'Search failed: ' + (error instanceof Error ? error.message : 'Unknown error');
      
      state.steps.push({
        type: 'observation',
        content: state.observation,
        timestamp: new Date(),
      });
    }
  }

  private async generateStep(state: WorkflowState, config: WorkflowConfig): Promise<void> {
    try {
      // Build context for generation
      let contextText = '';
      if (state.context) {
        contextText = `
        Context from research:
        - Database results: ${state.context.databaseResults.length} items
        - Vector results: ${state.context.vectorResults.length} items
        - Summary: ${state.context.summary}
        `;
      }

      const generatePrompt = `
      Based on the following analysis, generate a helpful response:
      
      Original Query: "${state.query}"
      My Thinking: ${state.thought}
      ${state.observation ? `Observations: ${state.observation}` : ''}
      ${contextText}
      
      Generate a ${config.tone || 'professional'} response in ${config.language || 'ukrainian'}.
      Be helpful, accurate, and use any context provided above.
      `;

      const response = await this.openaiService.createChatCompletion([
        { role: 'system', content: 'You are a helpful assistant generating responses based on research and analysis.' },
        { role: 'user', content: generatePrompt }
      ]);

      state.response = response.choices[0]?.message?.content || 'Unable to generate response';
      
      state.steps.push({
        type: 'action',
        content: 'GENERATE_RESPONSE',
        timestamp: new Date(),
      });
    } catch (error) {
      state.response = 'Error generating response: ' + (error instanceof Error ? error.message : 'Unknown error');
      
      state.steps.push({
        type: 'action',
        content: 'ERROR_IN_GENERATION',
        timestamp: new Date(),
      });
    }
  }

  // Helper method to get a readable trace of the workflow
  getWorkflowTrace(state: WorkflowState): string {
    return state.steps
      .map((step, index) => `${index + 1}. [${step.type.toUpperCase()}] ${step.content}`)
      .join('\n');
  }

  // Method to create a simple ReAct loop for testing
  async simpleReAct(query: string): Promise<{
    response: string;
    trace: string;
    steps: number;
  }> {
    const result = await this.executeReActWorkflow(query, {
      maxSteps: 5,
      tone: 'professional',
      language: 'ukrainian'
    });

    return {
      response: result.response || 'No response generated',
      trace: this.getWorkflowTrace(result),
      steps: result.steps.length,
    };
  }
}