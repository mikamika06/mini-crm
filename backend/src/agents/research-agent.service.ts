import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { PrismaService } from '../prisma/prisma.service';

interface SearchContext {
  query: string;
  type?: 'client' | 'invoice' | 'general';
  limit?: number;
}

interface ResearchResult {
  databaseResults: any[];
  vectorResults: any[];
  summary: string;
  confidence: number;
}

@Injectable()
export class ResearchAgentService {
  constructor(
    private openaiService: OpenAIService,
    private pineconeService: PineconeService,
    private prismaService: PrismaService,
  ) {}

  
  async research(context: SearchContext): Promise<ResearchResult> {
    try {
      const { query, type = 'general', limit = 10 } = context;

      const [databaseResults, vectorResults] = await Promise.all([
        this.searchDatabase(query, type, limit),
        this.searchVectors(query, limit),
      ]);

      const summary = await this.generateSummary(query, databaseResults, vectorResults);

      return {
        databaseResults,
        vectorResults,
        summary,
        confidence: this.calculateConfidence(databaseResults, vectorResults),
      };
    } catch (error) {
      console.error('Research error:', error);
      return {
        databaseResults: [],
        vectorResults: [],
        summary: 'Unable to retrieve research results',
        confidence: 0,
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
      const embedding = await this.openaiService.createEmbedding(query);
      const queryVector = embedding.data[0]?.embedding;

      if (!queryVector) {
        return [];
      }

      const searchResults = await this.pineconeService.queryVectors(
        queryVector,
        limit,
      );

      return searchResults.matches || [];
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  
  private async generateSummary(
    query: string,
    databaseResults: any[],
    vectorResults: any[],
  ): Promise<string> {
    try {
      const context = {
        query,
        databaseCount: databaseResults.length,
        vectorCount: vectorResults.length,
        sampleData: {
          database: databaseResults.slice(0, 3),
          vector: vectorResults.slice(0, 3),
        },
      };

      const prompt = `
        Based on the search results for query: "${query}"
        
        Database results found: ${context.databaseCount}
        Vector results found: ${context.vectorCount}
        
        Sample database results: ${JSON.stringify(context.sampleData.database, null, 2)}
        Sample vector results: ${JSON.stringify(context.sampleData.vector, null, 2)}
        
        Please provide a concise summary of the findings and their relevance to the query.
        Focus on the most important information that would be helpful for the user.
      `;

      const response = await this.openaiService.createChatCompletion([
        { role: 'user', content: prompt },
      ]);

      return response.choices[0]?.message?.content || 'No summary available';
    } catch (error) {
      console.error('Summary generation error:', error);
      return `Found ${databaseResults.length} database results and ${vectorResults.length} vector results for query: "${query}"`;
    }
  }


  private calculateConfidence(databaseResults: any[], vectorResults: any[]): number {
    const dbScore = Math.min(databaseResults.length * 0.3, 0.6);
    const vectorScore = Math.min(vectorResults.length * 0.2, 0.4);
    return Math.min(dbScore + vectorScore, 1.0);
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
}