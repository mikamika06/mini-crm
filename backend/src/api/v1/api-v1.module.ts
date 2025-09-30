import { Module } from '@nestjs/common';
import { AgentsController } from './agents/agents.controller';
import { AgentsModule } from '../../agents/agents.module';
import { AuthModule } from '../../auth/auth.module';
import { AnalyticsApiModule } from './analytics/analytics-api.module';

@Module({
  imports: [
    AgentsModule, 
    AuthModule,
    AnalyticsApiModule
  ],
  controllers: [AgentsController],
})
export class ApiV1Module {}