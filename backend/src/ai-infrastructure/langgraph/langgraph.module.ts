import { Module } from '@nestjs/common';
import { LangGraphService } from './langgraph.service';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [LangGraphService],
  exports: [LangGraphService],
})
export class LangGraphModule {}