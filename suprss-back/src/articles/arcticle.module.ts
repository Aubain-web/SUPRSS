import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { CollectionsModule } from '../collections/collection.module';
import { ArticlesController } from './article.controller';
import { ArticlesService } from './article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CollectionsModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
