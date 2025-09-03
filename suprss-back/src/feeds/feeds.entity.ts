import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Collection } from '../collections/collection.entity';
import { Article } from '../articles/article.entity';

@Entity('feeds')
export class Feed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  url: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @Column({ default: 3600 }) // 1 hour in seconds
  updateFrequency: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastFetchedAt: Date;

  @Column({ nullable: true })
  lastErrorAt: Date;

  @Column({ nullable: true, type: 'text' })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.feeds, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerId: string;

  @ManyToOne(() => Collection, (collection) => collection.feeds, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @Column({ nullable: true })
  collectionId: string;

  @OneToMany(() => Article, (article) => article.feed, { cascade: true })
  articles: Article[];

  @ManyToMany(() => User, (user) => user.favoriteFeeds)
  @JoinTable()
  favoritedBy: User[];
}
