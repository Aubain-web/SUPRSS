import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/auth.login.dto';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/auth.register.dto';

type OAuthProfile = {
  emails?: Array<{ value: string }>;
  email?: string;
  name?: { givenName?: string; familyName?: string };
  photos?: Array<{ value?: string }>;
};

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private sign(user: { id: string; email: string }): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  private toSafeUser(user: User): SafeUser {
    // Fix: Use proper destructuring to remove password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.users.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashed,
      // ne pas envoyer isActive si non défini dans le DTO
    });

    const token = this.sign(user);
    return { user: this.toSafeUser(user), token };
  }

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const token = this.sign(user);
    return { user: this.toSafeUser(user), token };
  }

  async validateUserByJwt(payload: { sub: string; email: string }) {
    // Fix Prettier + utilise findById qu'on vient d'ajouter
    const user =
      (await this.users.findById(payload.sub)) ?? (await this.users.findOne(payload.sub));
    if (!user) throw new UnauthorizedException();
    return this.toSafeUser(user);
  }

  async handleOAuthLogin(profile: OAuthProfile, provider: 'google' | 'github') {
    const email = profile?.emails?.[0]?.value ?? profile?.email;
    if (!email) throw new UnauthorizedException('Email introuvable via OAuth');

    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.create({
        email,
        firstName: profile?.name?.givenName || 'OAuth',
        lastName: profile?.name?.familyName || provider,
        // ne pas envoyer "password: null" si ton DTO n'accepte pas null
        avatar: profile?.photos?.[0]?.value ?? undefined,
      });
    }

    const token = this.sign(user);
    return { user: this.toSafeUser(user), token };
  }
}
