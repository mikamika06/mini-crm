import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  create(data: any, userId: number) {
    return this.prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        userId,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.client.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
