import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Entity('tags')
export class Tag {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string;

  @Field(() => [Post], { nullable: true })
  @ManyToMany(() => Post, (post) => post.tags)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'post_id', referencedColumnName: 'id' },
  })
  posts: Post[];
}
