import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

// Core modules
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AIInfrastructureModule } from './ai-infrastructure/ai-infrastructure.module';
import { AgentsModule } from './agents/agents.module';
import { SharedModule } from './shared/shared.module';
import { ApiModule } from './api/api.module';

// Legacy modules (to be refactored)
import { UserController } from './user.controller';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';

@Controller()
class HealthController {
  @Get('/')
  root() {
    return { message: 'Multi-Agent CRM System is running!', status: 'healthy' };
  }

  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          return {
            store: redisStore,
            url: redisUrl,
          };
        }
        
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        };
      },
      inject: [ConfigService],
    }),
    // Core modules
    DatabaseModule,
    AIInfrastructureModule,
    SharedModule,
    AgentsModule,
    ApiModule,
    // Legacy modules
    AuthModule,
    ClientModule,
    InvoiceModule,
  ],
  controllers: [UserController, HealthController],
})
export class AppModule {}
