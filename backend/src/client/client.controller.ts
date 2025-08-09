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
import { CreateClientDto } from './dto/create-client.dto';

@UseGuards(JwtGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll(@GetUser() user: { id: number }) {
    return this.clientService.findAll(user.id);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto, @GetUser() user: { id: number }) {
    return this.clientService.create(createClientDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { id: number }) {
    return this.clientService.remove(+id, user.id);
  }
}
