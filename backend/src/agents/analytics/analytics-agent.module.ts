import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';
import { AnalyticsToolsService } from './analytics-tools.service';
import { DatabaseAnalyticsService } from './database-analytics.service';
import { OpenAIModule } from '../../ai-infrastructure/openai/openai.module';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [
    OpenAIModule,
    PrismaModule
  ],
  providers: [
    AnalyticsAgentService,
    AnalyticsToolsService,
    DatabaseAnalyticsService
  ],
  exports: [
    AnalyticsAgentService,
    AnalyticsToolsService,
    DatabaseAnalyticsService
  ],
})
export class AnalyticsAgentModule {}