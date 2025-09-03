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
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/Jwt.auth.guard';
import { CurrentUser } from '../common/current-user';

@Controller('feeds')
@UseGuards(JwtAuthGuard)
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Post()
  create(@Body() createFeedDto: CreateFeedDto, @CurrentUser() user: User) {
    return this.feedsService.create(createFeedDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('collectionId') collectionId?: string) {
    return this.feedsService.findAll(user, collectionId);
  }

  @Get('favorites')
  getFavorites(@CurrentUser() user: User) {
    return this.feedsService.getFavorites(user);
  }

  @Get('by-tags')
  findByTags(@Query('tags') tags: string, @CurrentUser() user: User) {
    const tagArray = tags.split(',').map((tag) => tag.trim());
    return this.feedsService.findByTags(tagArray, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.feedsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedDto: UpdateFeedDto,
    @CurrentUser() user: User,
  ) {
    return this.feedsService.update(id, updateFeedDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.feedsService.remove(id, user);
  }

  @Post(':id/favorite')
  toggleFavorite(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.feedsService.toggleFavorite(id, user);
  }
}
