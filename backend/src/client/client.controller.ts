import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ClientService } from './client.service';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
 create(@Body() dto: any, @GetUser() user: { id: number }) {
  return this.clientService.create({ ...dto, userId: user.id });
}

  @Get()
  findAll(@GetUser() user: { id: number }) {
    return this.clientService.findAll(user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: { id: number }) {
    return this.clientService.delete(+id, user.id);
  }
}
