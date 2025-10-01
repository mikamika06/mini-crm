import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research-agent.module';
import { CommunicationModule } from './communication/communication-agent.module';
import { AnalyticsAgentModule } from './analytics/analytics-agent.module';
import { CoordinatorModule } from './coordinator/coordinator.module';

@Module({
  imports: [
    ResearchModule, 
    CommunicationModule, 
    AnalyticsAgentModule,
    CoordinatorModule
  ],
  exports: [
    ResearchModule, 
    CommunicationModule, 
    AnalyticsAgentModule,
    CoordinatorModule
  ],
})
export class AgentsModule {}