import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
export declare class MessagesService {
    private readonly repo;
    constructor(repo: Repository<Message>);
    create(dto: CreateMessageDto, user: User): Promise<Message>;
    update(id: string, dto: UpdateMessageDto, user: User): Promise<Message>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    findByCollection(collectionId: string): Promise<Message[]>;
}
