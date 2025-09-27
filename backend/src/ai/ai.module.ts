import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { OpenAIModule } from '../openai/openai.module';
import { PineconeModule } from '../pinecone/pinecone.module';
import { LangGraphModule } from '../langgraph/langgraph.module';

@Module({
  imports: [OpenAIModule, PineconeModule, LangGraphModule],
  controllers: [AIController],
})
export class AIModule {}