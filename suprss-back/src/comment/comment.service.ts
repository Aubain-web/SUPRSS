import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../user/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private readonly repo: Repository<Comment>) {}

  async create(dto: CreateCommentDto, user: User) {
    const comment = this.repo.create({
      content: dto.content,
      articleId: dto.articleId,
      authorId: user.id,
    });
    return this.repo.save(comment);
  }

  async update(id: string, dto: UpdateCommentDto, user: User) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== user.id) {
      throw new ForbiddenException('Not your comment');
    }
    Object.assign(comment, dto);
    return this.repo.save(comment);
  }

  async remove(id: string, user: User) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== user.id) {
      throw new ForbiddenException('Not your comment');
    }
    await this.repo.remove(comment);
    return { deleted: true };
  }

  async findByArticle(articleId: string) {
    return this.repo.find({
      where: { articleId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
}
