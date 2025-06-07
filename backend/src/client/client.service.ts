import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; email: string; company?: string; userId: number }) {
    return this.prisma.client.create({ data });
  }

  findAll(userId: number) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  delete(id: number, userId: number) {
    return this.prisma.client.deleteMany({
      where: { id, userId },
    });
  }
}
