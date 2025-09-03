import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Collection } from '../collections/collection.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Collection, (collection) => collection.messages, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @Column()
  collectionId: string;
}
