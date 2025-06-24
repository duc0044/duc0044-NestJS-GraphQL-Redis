import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsString()
  @MinLength(1)
  content: string;

  @Field(() => Int)
  @IsNumber()
  post_id: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  user_id?: number;
}

@InputType()
export class UpdateCommentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
