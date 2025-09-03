import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/Jwt.auth.guard';
import { CommentsService } from './comment.service';
import { CurrentUser } from '../common/current-user';
import { CreateCommentDto, UpdateCommentDto } from './create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto, @CurrentUser() user: User) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user);
  }

  @Get('article/:articleId')
  getByArticle(@Param('articleId') articleId: string) {
    return this.service.findByArticle(articleId);
  }
}
