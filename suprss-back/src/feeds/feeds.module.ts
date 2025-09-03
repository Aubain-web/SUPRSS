import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { RssModule } from '../rss/rss.module';
import { Feed } from './feeds.entity';
import { CollectionsModule } from '../collections/collection.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feed]), RssModule, CollectionsModule],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
