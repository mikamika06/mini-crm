export interface CoordinatorRequest {
  query: string;
  context?: {
    clientId?: number;
    searchType?: 'general' | 'client' | 'invoice' | 'analytics';
    limit?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  };
}

export interface CoordinatorResponse {
  response: string;
  workflowId: string;
  strategy: string;
  executedSteps: WorkflowStep[];
  agentResults: AgentExecutionResult[];
  processingTime: number;
  confidence: number;
  metadata: {
    timestamp: string;
    totalAgentsUsed: number;
    workflowSuccess: boolean;
    error?: string;
  };
}

export interface WorkflowState {
  workflowId: string;
  currentStep: string;
  agentResults: AgentExecutionResult[];
  executedSteps: WorkflowStep[];
  isComplete: boolean;
}

export interface AgentExecutionResult {
  agent: AgentType;
  result: any;
  success: boolean;
  error?: string;
  processingTime: number;
  timestamp: string;
}

export interface WorkflowStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: number;
  output: string;
}

export type AgentType = 'research' | 'communication' | 'analytics';

export interface CoordinationStrategy {
  type: 'analytics-first' | 'research-first' | 'communication-focused' | 'error';
  requiredAgents: AgentType[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
}

// LangGraph workflow node definitions
export interface WorkflowNode {
  id: string;
  type: AgentType | 'start' | 'end' | 'decision';
  agent?: AgentType;
  condition?: (state: WorkflowState) => boolean;
  next?: string[];
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  startNode: string;
  endNode: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: (state: WorkflowState) => boolean;
  label?: string;
}

// Request/Response DTOs for specific coordination scenarios
export interface AnalyticsCoordinationRequest {
  query: string;
  context: {
    clientId: number;
    includeChurnAnalysis?: boolean;
    includeToneAnalysis?: boolean;
    includePriorityAssessment?: boolean;
    searchType?: 'general' | 'client' | 'invoice' | 'analytics';
    limit?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  };
}

export interface ResearchCoordinationRequest {
  query: string;
  context: {
    searchType: 'general' | 'client' | 'invoice' | 'analytics';
    limit: number;
    includeVectorSearch?: boolean;
    includeDatabaseSearch?: boolean;
    clientId?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  };
}

export interface CommunicationCoordinationRequest {
  query: string;
  context: {
    tone?: 'professional' | 'friendly' | 'urgent' | 'casual';
    template?: string;
    includeAnalytics?: boolean;
    includeResearch?: boolean;
    clientId?: number;
    searchType?: 'general' | 'client' | 'invoice' | 'analytics';
    limit?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  };
}

// Health check interfaces
export interface AgentHealthStatus {
  agent: AgentType;
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface CoordinatorHealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  agents: AgentHealthStatus[];
  overallResponseTime: number;
  timestamp: string;
}

// Workflow execution context
export interface ExecutionContext {
  workflowId: string;
  startTime: number;
  request: CoordinatorRequest;
  strategy: CoordinationStrategy;
  currentStep: string;
  stepResults: Map<string, AgentExecutionResult>;
  errors: string[];
}