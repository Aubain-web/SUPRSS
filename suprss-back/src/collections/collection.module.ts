import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collection.service';
import { Collection } from './collection.entity';
import { CollectionMember } from './collection-members';
import { CollectionsController } from './collection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionMember])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
