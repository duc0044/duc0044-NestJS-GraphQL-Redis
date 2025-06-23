import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { CreateUserInput, UpdateUserInput } from './dto/users.dto';
import { UserResponse } from './dto/user-response.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [User], { name: 'users' })
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @Query(() => User, { name: 'user', nullable: true })
  async user(@Args('id') id: number): Promise<User | null> {
    return await this.usersService.findOne(id);
  }

  @Mutation(() => UserResponse)
  async createUser(@Args('user') user: CreateUserInput): Promise<UserResponse> {
    const created = await this.usersService.create(user);
    return {
      message: 'Tạo user thành công!',
      user: created,
    };
  }

  @Mutation(() => UserResponse)
  async updateUser(@Args('user') user: UpdateUserInput): Promise<UserResponse> {
    const updated = await this.usersService.update(user.id, user);
    return {
      message: 'Cập nhật user thành công!',
      user: updated,
    };
  }

  @Mutation(() => UserResponse)
  async deleteUser(@Args('id') id: number): Promise<UserResponse> {
    const deleted = await this.usersService.delete(id);
    return {
      message: 'Xóa user thành công!',
      user: deleted,
    };
  }
}
