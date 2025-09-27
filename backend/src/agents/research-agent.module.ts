import { Module } from '@nestjs/common';
import { ResearchAgentService } from './research-agent.service';
import { ResearchController } from './research.controller';
import { OpenAIModule } from '../openai/openai.module';
import { PineconeModule } from '../pinecone/pinecone.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [OpenAIModule, PineconeModule, PrismaModule],
  controllers: [ResearchController],
  providers: [ResearchAgentService],
  exports: [ResearchAgentService],
})
export class ResearchAgentModule {}