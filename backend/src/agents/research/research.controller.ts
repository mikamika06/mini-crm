import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/jwt.guard';
import { ResearchAgentService } from './research-agent.service';

interface ResearchRequest {
  query: string;
  type?: 'client' | 'invoice' | 'general';
  limit?: number;
}

interface IndexDataRequest {
  data: Array<{
    id: string;
    text: string;
    metadata?: any;
  }>;
}

@Controller('research')
@UseGuards(JwtGuard)
export class ResearchController {
  constructor(private researchAgentService: ResearchAgentService) {}

  @Post('search')
  async search(@Body() request: ResearchRequest) {
    try {
      const { query, type = 'general', limit = 10 } = request;

      const results = await this.researchAgentService.research({
        query,
        type,
        limit,
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  @Post('index')
  async indexData(@Body() request: IndexDataRequest) {
    try {
      await this.researchAgentService.indexData(request.data);

      return {
        success: true,
        message: `Successfully indexed ${request.data.length} items`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Indexing failed',
      };
    }
  }

  @Post('test-pinecone')
  async testPinecone() {
    return await this.researchAgentService.testPinecone();
  }

  @Post('demo')
  async demo() {
    try {
      const demoData = [
        {
          id: 'client-1',
          text: 'John Smith from TechCorp, CEO, interested in software development services',
          metadata: { type: 'client', company: 'TechCorp' },
        },
        {
          id: 'client-2', 
          text: 'Sarah Johnson from DesignHub, Marketing Director, needs branding and design work',
          metadata: { type: 'client', company: 'DesignHub' },
        },
        {
          id: 'invoice-1',
          text: 'Web development project for TechCorp, $5000, React and Node.js application',
          metadata: { type: 'invoice', amount: 5000, technology: 'React, Node.js' },
        },
        {
          id: 'invoice-2',
          text: 'Logo design and branding package for DesignHub, $2500, includes brand guidelines',
          metadata: { type: 'invoice', amount: 2500, service: 'design' },
        },
      ];

      await this.researchAgentService.indexData(demoData);

      return {
        success: true,
        message: 'Demo data indexed successfully',
        data: demoData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Demo setup failed',
      };
    }
  }
}