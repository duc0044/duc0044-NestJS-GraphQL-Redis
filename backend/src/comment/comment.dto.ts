import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Post ID is required' })
  postId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Author ID is required' })
  authorId: number;
}
