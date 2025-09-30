// Communication Agent Core Interfaces
export interface CommunicationResponse {
  response: string;
  tone?: 'professional' | 'friendly' | 'formal';
  metadata?: {
    confidence: number;
    processingTime: number;
    sourceType: 'generated' | 'template';
  };
}

export interface DraftRequest {
  type: 'email' | 'message' | 'response';
  content: string;
  tone?: 'professional' | 'friendly' | 'formal';
  clientId?: number;
  customInstructions?: string;
}

export interface DraftResponse {
  draft: string;
  suggestedTone: 'professional' | 'friendly' | 'formal';
  metadata?: {
    wordCount: number;
    estimatedReadTime: number;
    formalityScore: number;
  };
}

// Enhanced Response Interfaces
export interface AnalyticsEnhancedResponse {
  response: string;
  analytics: {
    tone: any; // From analytics interfaces
    priority: any;
    churn?: any;
  };
  recommendedActions?: string[];
  escalationRequired?: boolean;
}

export interface SmartDraftRequest {
  type: 'email' | 'message' | 'response';
  content: string;
  clientId?: number;
  customTone?: 'professional' | 'friendly' | 'formal';
  includeAnalytics?: boolean;
}

export interface SmartDraftResponse {
  draft: string;
  analytics: {
    tone: any;
    priority: any;
    churn?: any;
  };
  recommendedActions: string[];
  suggestedFollowUp?: {
    timing: 'immediate' | '24h' | '48h' | 'week';
    method: 'email' | 'call' | 'meeting';
    priority: 'low' | 'medium' | 'high';
  };
}

// Communication Context Interfaces
export interface CommunicationContext {
  clientHistory?: any[];
  previousInteractions?: any[];
  preferences?: {
    preferredTone: 'professional' | 'friendly' | 'formal';
    communicationFrequency: 'daily' | 'weekly' | 'monthly';
    language: string;
  };
  businessContext?: any;
}

export interface ResponseGenerationRequest {
  query: string;
  clientId?: number;
  context?: CommunicationContext;
  responseType?: 'quick' | 'detailed' | 'analytics-enhanced';
}

// Workflow Integration Interfaces
export interface WorkflowStep {
  id: string;
  type: 'research' | 'analytics' | 'generation' | 'review';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface CommunicationWorkflow {
  id: string;
  request: ResponseGenerationRequest;
  steps: WorkflowStep[];
  finalResult?: CommunicationResponse;
  startTime: Date;
  endTime?: Date;
  totalProcessingTime?: number;
}

// Tool Response Interface
export interface CommunicationToolResponse<T> {
  result: T;
  description: string;
  confidence: number;
  processingTime: number;
}