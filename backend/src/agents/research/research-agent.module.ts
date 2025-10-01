import { Module } from '@nestjs/common';
import { ResearchAgentService } from './research-agent.service';
import { ResearchController } from './research.controller';
import { DatabaseModule } from '../../database/database.module';
import { AIInfrastructureModule } from '../../ai-infrastructure/ai-infrastructure.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AIInfrastructureModule, AuthModule],
  controllers: [ResearchController],
  providers: [ResearchAgentService],
  exports: [ResearchAgentService],
})
export class ResearchModule {}