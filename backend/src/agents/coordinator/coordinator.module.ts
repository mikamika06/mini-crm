import { Module } from '@nestjs/common';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorAgentService } from './coordinator-agent.service';
import { CoordinatorToolsService } from './coordinator-tools.service';

// Import other agent modules
import { ResearchModule } from '../research/research-agent.module';
import { CommunicationModule } from '../communication/communication-agent.module';
import { AnalyticsAgentModule } from '../analytics/analytics-agent.module';

// Import shared modules
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    ResearchModule,
    CommunicationModule,
    AnalyticsAgentModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [CoordinatorController],
  providers: [
    CoordinatorAgentService,
    CoordinatorToolsService,
  ],
  exports: [
    CoordinatorAgentService,
    CoordinatorToolsService,
  ],
})
export class CoordinatorModule {}