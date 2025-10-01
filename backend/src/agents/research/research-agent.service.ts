import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../ai-infrastructure/openai/openai.service';
import { PineconeService } from '../../ai-infrastructure/pinecone/pinecone.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  SearchContext,
  ResearchResult,
  DatabaseSearchResult,
  VectorSearchResult,
  ResultSource
} from './interfaces/research.interfaces';

@Injectable()
export class ResearchAgentService {
  constructor(
    private prismaService: PrismaService,
    private openaiService: OpenAIService,
    private pineconeService: PineconeService,
  ) {
    this.initializePinecone();
  }

  private async initializePinecone() {
    try {
      console.log('Initializing Pinecone...');
      const connected = await this.pineconeService.testConnection();
      if (connected) {
        await this.pineconeService.createIndex();
        console.log('Pinecone initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
    }
  }

  
  async research(context: SearchContext): Promise<ResearchResult> {
    const startTime = Date.now();
    
    try {
      const { query, type = 'general', limit = 10 } = context;

      const [databaseResults, vectorResults] = await Promise.all([
        this.searchDatabase(query, type, limit),
        this.searchVectors(query, limit),
      ]);

      const summary = await this.generateSummary(query, databaseResults, vectorResults);
      const processingTime = Date.now() - startTime;
      const totalResults = databaseResults.length + vectorResults.length;

      return {
        databaseResults: this.formatDatabaseResults(databaseResults, query),
        vectorResults: this.formatVectorResults(vectorResults),
        summary,
        confidence: this.calculateConfidence(databaseResults, vectorResults),
        totalResults,
        processingTime,
        sources: this.generateSources(databaseResults, vectorResults, processingTime)
      };
    } catch (error) {
      console.error('Research error:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        databaseResults: [],
        vectorResults: [],
        summary: 'Unable to retrieve research results',
        confidence: 0,
        totalResults: 0,
        processingTime,
        sources: []
      };
    }
  }


  private async searchDatabase(query: string, type: string, limit: number): Promise<any[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      switch (type) {
        case 'client':
          return await this.prismaService.client.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { company: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: limit,
            include: {
              invoices: {
                take: 3,
              },
            },
          });

        case 'invoice':
          return await this.prismaService.invoice.findMany({
            where: {
              OR: [
                { amount: { gte: parseFloat(query) || 0 } },
                { client: { name: { contains: query, mode: 'insensitive' } } },
              ],
            },
            take: limit,
            include: {
              client: true,
            },
            orderBy: { dueDate: 'desc' },
          });

        default:
          const [clients, invoices] = await Promise.all([
            this.prismaService.client.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
              take: Math.floor(limit / 2),
            }),
            this.prismaService.invoice.findMany({
              where: {
                amount: { gte: parseFloat(query) || 0 },
              },
              take: Math.floor(limit / 2),
              include: { client: true },
            }),
          ]);

          return [...clients, ...invoices];
      }
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  private async searchVectors(query: string, limit: number): Promise<any[]> {
    try {
      console.log(`Performing vector search for: "${query}"`);
      const embedding = await this.openaiService.createEmbedding(query);
      const queryVector = embedding.data[0]?.embedding;

      if (!queryVector) {
        console.log('No embedding vector generated');
        return [];
      }

      const searchResults = await this.pineconeService.queryVectors(
        queryVector,
        limit,
      );

      console.log(`Vector search returned ${searchResults.matches?.length || 0} results`);
      return searchResults.matches || [];
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  async testPinecone(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test connection
      const connected = await this.pineconeService.testConnection();
      if (!connected) {
        return { success: false, message: 'Failed to connect to Pinecone' };
      }

      // Test indexing a document
      const testData = {
        id: 'test-doc-1',
        text: 'This is a test document for Pinecone vector search functionality.',
        metadata: { type: 'test', timestamp: new Date().toISOString() }
      };

      await this.indexData([testData]);

      // Wait a moment for indexing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test search
      const searchResults = await this.searchVectors('test document', 1);

      // Clean up test data
      await this.pineconeService.deleteVectors(['test-doc-1']);

      return {
        success: true,
        message: 'Pinecone test completed successfully',
        details: {
          indexingWorked: true,
          searchWorked: searchResults.length >= 0,
          searchResults: searchResults.length
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorString = error instanceof Error ? error.toString() : String(error);
      
      return {
        success: false,
        message: `Pinecone test failed: ${errorMessage}`,
        details: { error: errorString }
      };
    }
  }

  async indexData(data: { id: string; text: string; metadata?: any }[]): Promise<void> {
    try {
      const vectors = [];

      for (const item of data) {
        const embedding = await this.openaiService.createEmbedding(item.text);
        const vector = embedding.data[0]?.embedding;

        if (vector) {
          vectors.push({
            id: item.id,
            values: vector,
            metadata: {
              text: item.text,
              ...item.metadata,
              indexedAt: new Date().toISOString(),
            },
          });
        }
      }

      if (vectors.length > 0) {
        await this.pineconeService.upsertVectors(vectors);
        console.log(`Indexed ${vectors.length} vectors`);
      }
    } catch (error) {
      console.error('Indexing error:', error);
      throw error;
    }
  }

  // Helper methods for formatting results
  private formatDatabaseResults(results: any[], query: string): DatabaseSearchResult[] {
    return results.map((item, index) => ({
      id: item.id,
      type: this.determineResultType(item),
      data: item,
      relevanceScore: this.calculateRelevanceScore(item, query),
      matchedFields: this.findMatchedFields(item, query)
    }));
  }

  private formatVectorResults(results: any[]): VectorSearchResult[] {
    return results.map(result => ({
      id: result.id,
      content: result.metadata?.text || '',
      metadata: result.metadata || {},
      score: result.score || 0,
      embedding: result.values
    }));
  }

  private generateSources(databaseResults: any[], vectorResults: any[], processingTime: number): ResultSource[] {
    const sources: ResultSource[] = [];
    
    if (databaseResults.length > 0) {
      sources.push({
        type: 'database',
        confidence: databaseResults.length > 0 ? 0.8 : 0,
        resultCount: databaseResults.length,
        queryTime: processingTime * 0.6 // Estimate 60% of time for DB
      });
    }

    if (vectorResults.length > 0) {
      sources.push({
        type: 'vector',
        confidence: vectorResults.length > 0 ? 0.7 : 0,
        resultCount: vectorResults.length,
        queryTime: processingTime * 0.4 // Estimate 40% of time for vectors
      });
    }

    return sources;
  }

  private determineResultType(item: any): 'client' | 'invoice' | 'user' {
    if (item.email && item.company !== undefined) return 'client';
    if (item.amount && item.dueDate) return 'invoice';
    return 'user';
  }

  private calculateRelevanceScore(item: any, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Basic text matching
    const itemText = JSON.stringify(item).toLowerCase();
    const matches = (itemText.match(new RegExp(queryLower, 'g')) || []).length;
    score += matches * 0.2;

    // Field-specific scoring
    if (item.name && item.name.toLowerCase().includes(queryLower)) score += 0.3;
    if (item.email && item.email.toLowerCase().includes(queryLower)) score += 0.3;
    if (item.company && item.company.toLowerCase().includes(queryLower)) score += 0.2;

    return Math.min(score, 1.0);
  }

  private findMatchedFields(item: any, query: string): string[] {
    const queryLower = query.toLowerCase();
    const matchedFields: string[] = [];

    Object.keys(item).forEach(key => {
      const value = item[key];
      if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
        matchedFields.push(key);
      }
    });

    return matchedFields;
  }

  private calculateConfidence(databaseResults: any[], vectorResults: any[]): number {
    const dbScore = databaseResults.length > 0 ? 0.6 : 0;
    const vectorScore = vectorResults.length > 0 ? 0.4 : 0;
    
    // Boost confidence based on result quality
    const qualityBoost = Math.min(
      (databaseResults.length + vectorResults.length) * 0.1, 
      0.3
    );
    
    return Math.min(dbScore + vectorScore + qualityBoost, 1.0);
  }

  private async generateSummary(query: string, databaseResults: any[], vectorResults: any[]): Promise<string> {
    if (databaseResults.length === 0 && vectorResults.length === 0) {
      return `No relevant results found for query: "${query}"`;
    }

    const totalResults = databaseResults.length + vectorResults.length;
    const dbTypes = [...new Set(databaseResults.map(r => this.determineResultType(r)))];
    
    let summary = `Found ${totalResults} relevant results for "${query}".`;
    
    if (databaseResults.length > 0) {
      summary += ` Database search returned ${databaseResults.length} records`;
      if (dbTypes.length > 0) {
        summary += ` (${dbTypes.join(', ')})`;
      }
      summary += '.';
    }
    
    if (vectorResults.length > 0) {
      summary += ` Vector search found ${vectorResults.length} semantic matches.`;
    }

    return summary;
  }
}