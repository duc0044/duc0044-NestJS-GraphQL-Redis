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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';

@ObjectType()
@Entity('posts')
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field()
  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Field()
  @Column({ type: 'longtext' })
  content: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;

  @Field()
  @Column()
  user_id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category_id: number;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field(() => [Tag], { nullable: true })
  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
