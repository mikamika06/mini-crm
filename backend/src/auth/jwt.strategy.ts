import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    const secret = config.get('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req?.headers?.cookie;
        if (!cookie) return null;

        const token = cookie
          .split(';')
          .find(c => c.trim().startsWith('token='))
          ?.split('=')[1];

        return token || null;
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { id: number; email: string }) {
    return { id: payload.id, email: payload.email };
  }
}
