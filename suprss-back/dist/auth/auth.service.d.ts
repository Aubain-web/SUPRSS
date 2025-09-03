import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/auth.login.dto';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/auth.register.dto';
type OAuthProfile = {
    emails?: Array<{
        value: string;
    }>;
    email?: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    photos?: Array<{
        value?: string;
    }>;
};
type SafeUser = Omit<User, 'password'>;
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    private sign;
    private toSafeUser;
    register(dto: RegisterDto): Promise<{
        user: SafeUser;
        token: string;
    }>;
    validateUser(email: string, password: string): Promise<User | null>;
    login(dto: LoginDto): Promise<{
        user: SafeUser;
        token: string;
    }>;
    validateUserByJwt(payload: {
        sub: string;
        email: string;
    }): Promise<SafeUser>;
    handleOAuthLogin(profile: OAuthProfile, provider: 'google' | 'github'): Promise<{
        user: SafeUser;
        token: string;
    }>;
}
export {};
