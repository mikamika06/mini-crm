import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { id: 'desc' },
    });
  }

  create(data: any, userId: number) {
    return this.prisma.invoice.create({
      data: {
        amount: data.amount,
        dueDate: data.dueDate,
        paid: false,
        clientId: data.clientId,
        userId,
      },
    });
  }

  markPaid(id: number, userId: number) {
    return this.prisma.invoice.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        paid: true,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.invoice.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
