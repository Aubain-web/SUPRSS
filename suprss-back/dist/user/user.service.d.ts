import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByOAuthId(provider: string, oauthId: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    linkOAuthAccount(userId: string, provider: string, oauthId: string): Promise<void>;
    updatePreferences(id: string, preferences: Partial<Pick<User, 'darkMode' | 'fontSize' | 'language'>>): Promise<User>;
}
