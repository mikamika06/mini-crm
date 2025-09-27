import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user.controller';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PrismaModule } from './prisma/prisma.module';
import { OpenAIModule } from './openai/openai.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { LangGraphModule } from './langgraph/langgraph.module';
import { AIModule } from './ai/ai.module';
import { ResearchAgentModule } from './agents/research-agent.module';

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
    PrismaModule,
    AuthModule,
    ClientModule,
    InvoiceModule,
    OpenAIModule,
    PineconeModule,
    LangGraphModule,
    AIModule,
    ResearchAgentModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
