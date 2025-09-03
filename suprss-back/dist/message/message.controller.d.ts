import { User } from '../user/user.entity';
import { MessagesService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
export declare class MessagesController {
    private readonly service;
    constructor(service: MessagesService);
    create(dto: CreateMessageDto, user: User): Promise<import("./message.entity").Message>;
    update(id: string, dto: UpdateMessageDto, user: User): Promise<import("./message.entity").Message>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    getByCollection(collectionId: string): Promise<import("./message.entity").Message[]>;
}
