import { Field, ObjectType, Int } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@ObjectType()
export class AuthUserDto {
  @Field(() => Int)
  id: number;

  @Field()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
}
