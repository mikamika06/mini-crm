import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsAgentModule } from '../../../agents/analytics/analytics-agent.module';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  imports: [
    AnalyticsAgentModule,
    AuthModule
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsApiModule {}