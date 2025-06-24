import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
