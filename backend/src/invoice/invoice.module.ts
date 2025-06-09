import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use authentication features

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InvoiceController],
  providers: [InvoiceService]
})
export class InvoiceModule {}
