import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll(@GetUser() user: { id: number }) {
    return this.clientService.findAll(user.id);
  }

  @Post()
  create(@Body() body: any, @GetUser() user: { id: number }) {
    return this.clientService.create(body, user.id);
  }
  

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { id: number }) {
    return this.clientService.remove(+id, user.id);
  }
}
