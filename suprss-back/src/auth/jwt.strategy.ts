import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

type JwtPayload = { sub: string; email: string };

// Le type de l'utilisateur "safe" renvoyé par AuthService
type SafeUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  // ajoute d'autres champs non sensibles si besoin
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      // Erreur explicite au démarrage si la variable n'est pas présente
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // <-- garanti string
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.authService.validateUserByJwt(payload);
    if (!user) throw new UnauthorizedException();
    return user as SafeUser; // attaché à req.user
  }
}
