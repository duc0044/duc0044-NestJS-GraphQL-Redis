import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(200, { message: 'Title must be less than 200 characters' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  @IsString()
  @MinLength(5, { message: 'Slug must be at least 5 characters' })
  @MaxLength(200, { message: 'Slug must be less than 200 characters' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @Field()
  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  @IsNotEmpty({ message: 'Content is required' })
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
