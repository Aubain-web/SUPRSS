import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Feed } from '../feeds/feeds.entity';
import { CollectionMember } from './collection-members';
import { Message } from '../message/message.entity';

@Entity('collection')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  inviteCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.ownedCollections, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => Feed, (feed) => feed.collection)
  feeds: Feed[];

  @OneToMany(() => CollectionMember, (member) => member.collection)
  members: CollectionMember[];

  @OneToMany(() => Message, (message) => message.collection)
  messages: Message[];
}
