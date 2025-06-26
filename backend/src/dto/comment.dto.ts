import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => Int)
  @IsNumber()
  user_id: number;

  @Field(() => Int)
  @IsNumber()
  post_id: number;
}

@InputType()
export class UpdateCommentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  post_id?: number;
}

// GraphQL type for top commenters
export class TopCommenter {
  @Field(() => Int)
  user_id: number;

  @Field()
  username: string;

  @Field(() => Int)
  comment_count: number;
}

// GraphQL type for cache stats
@ObjectType()
export class CacheStats {
  @Field(() => Int)
  totalKeys: number;

  @Field(() => [String])
  keys: string[];
}
