import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  id: number;
}
