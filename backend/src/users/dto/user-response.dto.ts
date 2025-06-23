// src/users/dto/user-response.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../users.entity';

@ObjectType()
export class UserResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [User], { nullable: true })
  users?: User[];
}