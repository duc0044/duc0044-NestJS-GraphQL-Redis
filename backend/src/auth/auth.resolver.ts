import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateUserInput, LoginInput } from '../users/dto/users.dto';
import { User } from '../users/users.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlJwtAuthGuard } from './gql-auth.guard';
import { AuthUserDto, LoginResponse } from './dto/auth.dto';
import { CurrentUser } from './current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  login(@Args('loginInput') loginInput: LoginInput): LoginResponse {
    return this.authService.login(loginInput.email, loginInput.password);
  }

  @Mutation(() => User)
  signup(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.authService.signup(createUserInput);
  }

  @Query(() => AuthUserDto)
  @UseGuards(GqlJwtAuthGuard)
  whoAmI(@CurrentUser() user: AuthUserDto): AuthUserDto {
    return user;
  }
}
