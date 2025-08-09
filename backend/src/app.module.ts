import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user.controller';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ClientModule,
    InvoiceModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
