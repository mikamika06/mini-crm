import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(@GetUser() user: { id: number }) {
    return this.invoiceService.findAll(user.id);
  }

  @Post()
  create(@Body() body: any, @GetUser() user: { id: number }) {
    return this.invoiceService.create(body, user.id);
  }

  @Patch(':id/pay')
  markPaid(@Param('id') id: string, @GetUser() user: { id: number }) {
    return this.invoiceService.markPaid(+id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { id: number }) {
    return this.invoiceService.remove(+id, user.id);
  }
}
