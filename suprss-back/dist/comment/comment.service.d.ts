import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../user/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './create-comment.dto';
export declare class CommentsService {
    private readonly repo;
    constructor(repo: Repository<Comment>);
    create(dto: CreateCommentDto, user: User): Promise<Comment>;
    update(id: string, dto: UpdateCommentDto, user: User): Promise<Comment>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    findByArticle(articleId: string): Promise<Comment[]>;
}
