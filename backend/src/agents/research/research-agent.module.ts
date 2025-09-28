import { Module } from '@nestjs/common';
import { ResearchAgentService } from './research-agent.service';
import { DatabaseModule } from '../../database/database.module';
import { AIInfrastructureModule } from '../../ai-infrastructure/ai-infrastructure.module';

@Module({
  imports: [DatabaseModule, AIInfrastructureModule],
  providers: [ResearchAgentService],
  exports: [ResearchAgentService],
})
export class ResearchModule {}