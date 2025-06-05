import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
 getMe(@Request() req: ExpressRequest) {
  return req.user;
}
}
