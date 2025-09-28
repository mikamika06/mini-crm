import { Module } from '@nestjs/common';
import { OpenAIModule } from './openai/openai.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { LangGraphModule } from './langgraph/langgraph.module';

@Module({
  imports: [OpenAIModule, PineconeModule, LangGraphModule],
  exports: [OpenAIModule, PineconeModule, LangGraphModule],
})
export class AIInfrastructureModule {}