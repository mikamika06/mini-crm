import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';
import { GetUser } from './auth/get-user.decorator';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: { id: number; email: string }) {
    return user;
  }
}
