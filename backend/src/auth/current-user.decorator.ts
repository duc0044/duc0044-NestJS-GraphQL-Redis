import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUserDto } from './dto/auth.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthUserDto => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user as AuthUserDto;
  },
);
