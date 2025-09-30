// Core Search Interfaces
export interface SearchContext {
  query: string;
  type?: 'client' | 'invoice' | 'general';
  limit?: number;
  filters?: SearchFilters;
  sorting?: SearchSorting;
}

export interface SearchFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  clientIds?: number[];
  status?: string[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

export interface SearchSorting {
  field: string;
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// Result Interfaces
export interface ResearchResult {
  databaseResults: DatabaseSearchResult[];
  vectorResults: VectorSearchResult[];
  summary: string;
  confidence: number;
  totalResults: number;
  processingTime: number;
  sources: ResultSource[];
}

export interface DatabaseSearchResult {
  id: string | number;
  type: 'client' | 'invoice' | 'user';
  data: any;
  relevanceScore: number;
  matchedFields: string[];
}

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: any;
  score: number;
  embedding?: number[];
}

export interface ResultSource {
  type: 'database' | 'vector' | 'generated';
  confidence: number;
  resultCount: number;
  queryTime: number;
}

// Advanced Research Interfaces
export interface SemanticSearchRequest {
  query: string;
  embeddingModel?: string;
  similarityThreshold?: number;
  maxResults?: number;
  includeMetadata?: boolean;
}

export interface SemanticSearchResult {
  results: VectorSearchResult[];
  queryEmbedding: number[];
  totalMatches: number;
  avgSimilarity: number;
  processingTime: number;
}

export interface DatabaseSearchRequest {
  query: string;
  searchType: 'client' | 'invoice' | 'general';
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
  sorting?: SearchSorting;
  includeRelated?: boolean;
}

export interface DatabaseSearchResponse {
  results: DatabaseSearchResult[];
  totalCount: number;
  hasMore: boolean;
  aggregations?: {
    [key: string]: any;
  };
  executionPlan?: {
    indexesUsed: string[];
    queryTime: number;
    resultsFetched: number;
  };
}

// Context Enhancement Interfaces
export interface ContextEnrichment {
  originalQuery: string;
  expandedQuery: string;
  synonyms: string[];
  relatedTerms: string[];
  contextualHints: string[];
  confidence: number;
}

export interface ResearchInsights {
  keyFindings: string[];
  patterns: {
    type: string;
    description: string;
    confidence: number;
  }[];
  recommendations: string[];
  dataQuality: {
    completeness: number;
    accuracy: number;
    freshness: number;
  };
}

// Research Tools Interfaces
export interface ResearchToolRequest {
  query: string;
  context?: any;
  options?: {
    includeVectorSearch?: boolean;
    includeDatabaseSearch?: boolean;
    generateSummary?: boolean;
    maxResults?: number;
  };
}

export interface ResearchToolResponse {
  result: ResearchResult;
  description: string;
  insights: ResearchInsights;
  performance: {
    totalTime: number;
    databaseTime: number;
    vectorTime: number;
    summaryTime: number;
  };
}

// Multi-Modal Research Interfaces
export interface MultiModalSearchRequest {
  textQuery?: string;
  imageQuery?: Buffer;
  audioQuery?: Buffer;
  filters?: SearchFilters;
  weights?: {
    text: number;
    semantic: number;
    structured: number;
  };
}

export interface CompositeSearchResult {
  textResults: ResearchResult;
  semanticResults: SemanticSearchResult;
  structuredResults: DatabaseSearchResponse;
  fusedResults: FusedSearchResult[];
  overallConfidence: number;
}

export interface FusedSearchResult {
  id: string;
  type: string;
  content: any;
  sources: string[];
  combinedScore: number;
  explanation: string;
}