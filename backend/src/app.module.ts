import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth.module';

// Blog modules
import { UserModule } from './modules/user.module';
import { CategoryModule } from './modules/category.module';
import { PostModule } from './modules/post.module';
import { CommentModule } from './modules/comment.module';
import { TagModule } from './modules/tag.module';

@Module({
  imports: [
    AppConfigModule,
    RedisModule,
    AuthModule,
    // Blog modules
    UserModule,
    CategoryModule,
    PostModule,
    CommentModule,
    TagModule,
  ],
})
export class AppModule {}
