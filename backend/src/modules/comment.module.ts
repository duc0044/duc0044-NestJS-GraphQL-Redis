import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from '../services/comment.service';
import { CommentResolver } from '../resolvers/comment.resolver';
import { Comment } from '../entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
