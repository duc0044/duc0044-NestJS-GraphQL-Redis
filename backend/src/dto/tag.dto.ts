import { InputType, Field, ObjectType } from '@nestjs/graphql';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { PaginationMeta } from './pagination.dto';
import { Tag } from '../entities/tag.entity';

@InputType()
export class CreateTagInput {
  @Field()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field()
  @IsString()
  @MinLength(2, { message: 'Slug must be at least 2 characters' })
  @MaxLength(50, { message: 'Slug must be less than 50 characters' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;
}

@InputType()
export class UpdateTagInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Slug must be at least 2 characters' })
  @MaxLength(50, { message: 'Slug must be less than 50 characters' })
  slug?: string;
}

@ObjectType()
export class PaginatedTagsResponse {
  @Field(() => [Tag])
  data: Tag[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
