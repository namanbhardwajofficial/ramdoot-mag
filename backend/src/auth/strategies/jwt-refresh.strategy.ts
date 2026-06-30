import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('User not found or inactive');

    return user;
  }
}
