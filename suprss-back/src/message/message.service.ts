import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private readonly repo: Repository<Message>) {}

  async create(dto: CreateMessageDto, user: User) {
    const msg = this.repo.create({
      content: dto.content,
      collectionId: dto.collectionId,
      authorId: user.id,
    });
    return this.repo.save(msg);
  }

  async update(id: string, dto: UpdateMessageDto, user: User) {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.authorId !== user.id) throw new ForbiddenException('Not your message');
    Object.assign(msg, dto);
    return this.repo.save(msg);
  }

  async remove(id: string, user: User) {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.authorId !== user.id) throw new ForbiddenException('Not your message');
    await this.repo.remove(msg);
    return { deleted: true };
  }

  async findByCollection(collectionId: string) {
    return this.repo.find({
      where: { collectionId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
}
