import { Module } from '@nestjs/common';
import { CommunicationAgentService } from './communication-agent.service';
import { AIInfrastructureModule } from '../../ai-infrastructure/ai-infrastructure.module';
import { ResearchModule } from '../research/research-agent.module';

@Module({
  imports: [AIInfrastructureModule, ResearchModule],
  providers: [CommunicationAgentService],
  exports: [CommunicationAgentService],
})
export class CommunicationModule {}