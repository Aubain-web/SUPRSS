import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from '../feeds/feeds.entity';
import { RssService } from './rss.service';
import { RssParserService } from './rss-paper.service';
import { ArticlesModule } from '../articles/arcticle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feed]), ArticlesModule],
  providers: [RssService, RssParserService],
  exports: [RssService, RssParserService],
})
export class RssModule {}
