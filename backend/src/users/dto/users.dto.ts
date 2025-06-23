import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
