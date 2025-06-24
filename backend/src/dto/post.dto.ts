import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  slug: string;

  @Field()
  @IsString()
  @MinLength(10)
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  tag_ids?: number[];
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  tag_ids?: number[];
}
