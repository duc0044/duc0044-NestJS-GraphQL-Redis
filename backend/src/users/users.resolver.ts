import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { CreateUserInput, UpdateUserInput } from './users.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @Query(() => User, { name: 'user' })
  async user(@Args('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('user') user: CreateUserInput): Promise<User> {
    return this.usersService.create(user);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(@Args('user') user: UpdateUserInput): Promise<User> {
    return this.usersService.update(user.id, user);
  }

  @Mutation(() => User, { name: 'deleteUser' })
  async deleteUser(@Args('id') id: number): Promise<User> {
    return this.usersService.delete(id);
  }
}
