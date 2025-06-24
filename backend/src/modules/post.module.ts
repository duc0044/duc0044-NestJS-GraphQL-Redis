import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from '../services/post.service';
import { PostResolver } from '../resolvers/post.resolver';
import { Post } from '../entities/post.entity';
import { Tag } from '../entities/tag.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag, Category, User]), RedisModule],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}
