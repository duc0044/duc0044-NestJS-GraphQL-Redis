import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;
}

@InputType()
export class UpdateTagInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug?: string;
}
