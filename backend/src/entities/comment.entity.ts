import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';
import { Post } from './post.entity';

@ObjectType()
@Entity('comments')
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field()
  @Column()
  post_id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  user_id: number;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.comments)
  user: User;
}
