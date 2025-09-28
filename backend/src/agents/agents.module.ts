import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research-agent.module';
import { CommunicationModule } from './communication/communication-agent.module';

@Module({
  imports: [ResearchModule, CommunicationModule],
  exports: [ResearchModule, CommunicationModule],
})
export class AgentsModule {}