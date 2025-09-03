// src/user/user.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'createdAt'],
    });
  }

  // --- AJOUT : findById pour l’AuthService/JwtStrategy ---
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'avatar',
        'darkMode',
        'fontSize',
        'language',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByOAuthId(provider: string, oauthId: string): Promise<User | null> {
    const whereCondition: Record<string, string> = {};
    whereCondition[`${provider}Id`] = oauthId;
    return this.userRepository.findOne({ where: whereCondition });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async linkOAuthAccount(userId: string, provider: string, oauthId: string): Promise<void> {
    const updateData: Record<string, string> = {};
    updateData[`${provider}Id`] = oauthId;
    await this.userRepository.update(userId, updateData);
  }

  async updatePreferences(
    id: string,
    preferences: Partial<Pick<User, 'darkMode' | 'fontSize' | 'language'>>,
  ): Promise<User> {
    await this.userRepository.update(id, preferences);
    return this.findOne(id);
  }
}
