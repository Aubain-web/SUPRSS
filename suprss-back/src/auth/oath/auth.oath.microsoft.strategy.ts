/*import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(config: ConfigService) {
    const options: any = {
      clientID: config.get<string>('MICROSOFT_CLIENT_ID')!,
      clientSecret: config.get<string>('MICROSOFT_CLIENT_SECRET')!,
      callbackURL: config.get<string>('MICROSOFT_CALLBACK_URL') ?? '/auth/microsoft/callback',
      scope: ['user.read'],
    };
    super(options);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ) {
    done(null, profile);
  }
}*/
