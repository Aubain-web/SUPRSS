import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collection.module';
import { ArticlesModule } from './articles/arcticle.module';
import { FeedsModule } from './feeds/feeds.module';
import { RssModule } from './rss/rss.module';
import { UsersModule } from './user/user.module';
import { CommentsModule } from './comment/comment.module';
import { MessagesModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    FeedsModule,
    ArticlesModule,
    CollectionsModule,
    CommentsModule,
    MessagesModule,
    RssModule,
  ],
})
export class AppModule {}
