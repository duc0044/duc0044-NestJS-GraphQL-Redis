import { Module, Global } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Global()
@Module({
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule { }
