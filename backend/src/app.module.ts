import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [AppConfigModule, UsersModule],
})
export class AppModule {}
