import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserInput, UpdateUserInput, LoginInput } from '../dto/user.dto';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class LoginResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(AuthGuard, RolesGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  async updateMyProfile(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    // Users can only update their own profile, not their role
    const { role, ...updateData } = updateUserInput;
    return this.userService.update(user.id, updateData);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.userService.login(loginInput);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async promoteToAdmin(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.promoteToAdmin(userId);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async demoteToUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.demoteToUser(userId);
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async isAdmin(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.isAdmin(userId);
  }
}
