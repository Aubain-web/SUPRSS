import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticleFilters, ArticlesService } from './article.service';
import { User } from '../user/user.entity';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from 'src/auth/Jwt.auth.guard';
import { CurrentUser } from '../common/current-user';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('feedIds') feedIds?: string,
    @Query('categories') categories?: string,
    @Query('isRead') isRead?: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filters: ArticleFilters = {};

    if (feedIds) filters.feedIds = feedIds.split(',');
    if (categories) filters.categories = categories.split(',');
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (isFavorite !== undefined) filters.isFavorite = isFavorite === 'true';
    if (search) filters.search = search;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    return this.articlesService.findAll(user, filters);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: User) {
    return this.articlesService.getUnreadCount(user);
  }

  @Get('favorites')
  getFavorites(@CurrentUser() user: User) {
    return this.articlesService.getFavorites(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.articlesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.articlesService.remove(id, user);
  }

  @Post(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.articlesService.markAsRead(id, user);
  }

  @Delete(':id/read')
  markAsUnread(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.articlesService.markAsUnread(id, user);
  }

  @Post(':id/favorite')
  toggleFavorite(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.articlesService.toggleFavorite(id, user);
  }

  @Post('mark-all-read')
  markAllAsRead(@Body('feedIds') feedIds: string[], @CurrentUser() user: User) {
    return this.articlesService.markAllAsRead(feedIds, user);
  }
}
