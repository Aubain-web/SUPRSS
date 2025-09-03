// src/user/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Feed } from '../feeds/feeds.entity';
import { CollectionMember } from '../collections/collection-members';
import { Message } from '../message/message.entity';
import { Collection } from '../collections/collection.entity';
import { Comment } from '../comment/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  // ✅ forcer type varchar + nullable ; optionnel: select:false pour ne jamais renvoyer par défaut
  @Exclude()
  @Column({ type: 'varchar', nullable: true, select: false })
  password: string | null;

  @Column({ type: 'varchar', nullable: true })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true })
  githubId: string | null;

  @Column({ type: 'varchar', nullable: true })
  microsoftId: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'boolean', default: false })
  darkMode: boolean;

  @Column({ type: 'varchar', default: 'medium' })
  fontSize: string;

  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Feed, (feed) => feed.owner)
  feeds: Feed[];

  @OneToMany(() => Collection, (collection) => collection.owner)
  ownedCollections: Collection[];

  @OneToMany(() => CollectionMember, (member) => member.user)
  collectionMemberships: CollectionMember[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Message, (message) => message.author)
  messages: Message[];

  @ManyToMany(() => Feed, (feed) => feed.favoritedBy)
  favoriteFeeds: Feed[];
}
