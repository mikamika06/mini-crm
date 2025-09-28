export interface AIConfig {
  openai: {
    apiKey: string;
    model: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  langsmith: {
    tracing: boolean;
    apiKey?: string;
  };
}

export const aiConfig = (): AIConfig => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX_NAME || '',
  },
  langsmith: {
    tracing: process.env.LANGSMITH_TRACING === 'true',
    apiKey: process.env.LANGSMITH_API_KEY,
  },
});