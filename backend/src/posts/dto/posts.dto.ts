import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  content: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Author ID is required' })
  authorId: number;
}

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
  @Field(() => Int)
  id: number;
}
