import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module'; 
import { UserController } from './user.controller';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';
@Module({
  imports: [AuthModule, ClientModule, InvoiceModule], 
   controllers: [UserController],
})
export class AppModule {}
