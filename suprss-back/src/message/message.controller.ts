import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/Jwt.auth.guard';
import { MessagesService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { CurrentUser } from '../common/current-user';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMessageDto, @CurrentUser() user: User) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user);
  }

  @Get('collection/:collectionId')
  getByCollection(@Param('collectionId') collectionId: string) {
    return this.service.findByCollection(collectionId);
  }
}
