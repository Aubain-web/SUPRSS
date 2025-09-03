import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Collection } from './collection.entity';
import { User } from '../user/user.entity';

export enum Permission {
  READ = 'read',
  ADD_FEED = 'add_feed',
  EDIT_FEED = 'edit_feed',
  DELETE_FEED = 'delete_feed',
  COMMENT = 'comment',
  ADMIN = 'admin',
}

@Entity('collection_members')
export class CollectionMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  permissions: Permission[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => User, (user) => user.collectionMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Collection, (collection) => collection.members, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @Column()
  collectionId: string;
}
