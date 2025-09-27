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

  getClient(): Pinecone {
    return this.pinecone;
  }
}