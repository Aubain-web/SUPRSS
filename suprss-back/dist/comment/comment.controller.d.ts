import { User } from '../user/user.entity';
import { CommentsService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './create-comment.dto';
export declare class CommentsController {
    private readonly service;
    constructor(service: CommentsService);
    create(dto: CreateCommentDto, user: User): Promise<import("./comment.entity").Comment>;
    update(id: string, dto: UpdateCommentDto, user: User): Promise<import("./comment.entity").Comment>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    getByArticle(articleId: string): Promise<import("./comment.entity").Comment[]>;
}
