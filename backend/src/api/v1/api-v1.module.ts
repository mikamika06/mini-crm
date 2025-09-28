import { Module } from '@nestjs/common';
import { AgentsController } from './agents/agents.controller';
import { AgentsModule } from '../../agents/agents.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AgentsModule, AuthModule],
  controllers: [AgentsController],
})
export class ApiV1Module {}