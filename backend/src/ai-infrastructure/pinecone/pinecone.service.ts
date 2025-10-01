import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor(private configService: ConfigService) {
    this.pinecone = new Pinecone({
      apiKey: this.configService.get('PINECONE_API_KEY') || '',
    });
    this.indexName = this.configService.get('PINECONE_INDEX_NAME') || '';
  }

  async getIndex() {
    return this.pinecone.index(this.indexName);
  }

  async upsertVectors(vectors: any[]) {
    const index = await this.getIndex();
    return await index.upsert(vectors);
  }

  async queryVectors(vector: number[], topK: number = 5, filter?: any) {
    const index = await this.getIndex();
    return await index.query({
      vector,
      topK,
      filter,
      includeMetadata: true,
      includeValues: false,
    });
  }

  async deleteVectors(ids: string[]) {
    const index = await this.getIndex();
    return await index.deleteMany(ids);
  }

  async createIndex() {
    try {
      const indexList = await this.pinecone.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === this.indexName);
      
      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // OpenAI text-embedding-3-small dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        console.log(`Index ${this.indexName} created successfully`);
        
        // Wait for index to be ready
        await this.waitForIndexReady();
      } else {
        console.log(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      console.error('Error creating Pinecone index:', error);
      throw error;
    }
  }

  async waitForIndexReady() {
    let ready = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!ready && attempts < maxAttempts) {
      try {
        const indexDescription = await this.pinecone.describeIndex(this.indexName);
        ready = indexDescription.status?.ready === true;
        
        if (!ready) {
          console.log(`Waiting for index ${this.indexName} to be ready... (${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log(`Index not ready yet... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      attempts++;
    }
    
    if (!ready) {
      throw new Error(`Index ${this.indexName} did not become ready within timeout`);
    }
    
    console.log(`Index ${this.indexName} is ready!`);
  }

  async testConnection() {
    try {
      const indexList = await this.pinecone.listIndexes();
      console.log('Pinecone connection successful. Available indexes:', indexList.indexes?.map(i => i.name));
      return true;
    } catch (error) {
      console.error('Pinecone connection failed:', error);
      return false;
    }
  }

  getClient(): Pinecone {
    return this.pinecone;
  }
}