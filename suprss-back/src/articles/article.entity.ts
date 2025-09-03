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
  Index,
} from 'typeorm';
import { Feed } from '../feeds/feeds.entity';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  link: string;

  @Column({ type: 'varchar', nullable: true })
  author: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'timestamptz' })
  publishedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column('simple-array', { default: '' })
  categories: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Feed, (feed) => feed.articles, { onDelete: 'CASCADE', nullable: false })
  feed: Feed;

  @Column({ type: 'uuid' })
  feedId: string;

  @OneToMany(() => Comment, (comment) => comment.article, { cascade: true })
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_read_articles',
    joinColumn: { name: 'article_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  readBy: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_favorite_articles',
    joinColumn: { name: 'article_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  favoritedBy: User[];
}
