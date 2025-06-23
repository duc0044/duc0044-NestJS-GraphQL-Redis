import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';
import { CreateUserInput } from 'src/users/dto/users.dto';
import { AuthUserDto, LoginResponse } from './dto/auth.dto';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user as AuthUserDto;
  },
);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<AuthUserDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
      };
    }
    return null;
  }

  login(email: string, password: string): LoginResponse {
    const payload = { email, password };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(createUserInput: CreateUserInput): Promise<User> {
    if (await this.usersService.findByEmail(createUserInput.email)) {
      throw new Error('Email already exists');
    }
    const user = await this.usersService.create(createUserInput);
    return user;
  }
}
