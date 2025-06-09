import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies['token'];

    if (!token) throw new UnauthorizedException('No token');

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      req.user = decoded; 
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
