import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentService } from '../services/comment.service';
import { Comment } from '../entities/comment.entity';
import {
  CreateCommentInput,
  UpdateCommentInput,
  CacheStats,
} from '../dto/comment.dto';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    return this.commentService.create(createCommentInput);
  }

  @Query(() => [Comment], { name: 'comments' })
  async findAll() {
    return this.commentService.findAll();
  }

  @Query(() => Comment, { name: 'comment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.commentService.findOne(id);
  }

  @Query(() => [Comment], { name: 'commentsByPost' })
  async findByPost(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentService.findByPost(postId);
  }

  @Query(() => [Comment], { name: 'commentsByUser' })
  async findByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.commentService.findByUser(userId);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ) {
    return this.commentService.update(id, updateCommentInput);
  }

  @Mutation(() => Boolean)
  async removeComment(@Args('id', { type: () => Int }) id: number) {
    return this.commentService.remove(id);
  }

  // New queries with Redis caching

  @Query(() => [Comment], { name: 'searchComments' })
  async searchComments(@Args('searchTerm') searchTerm: string) {
    return this.commentService.searchComments(searchTerm);
  }

  @Query(() => [Comment], { name: 'commentsByDateRange' })
  async getCommentsByDateRange(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    return this.commentService.getCommentsByDateRange(startDate, endDate);
  }

  // Cache management queries
  @Query(() => CacheStats, { name: 'commentCacheStats' })
  async getCacheStats() {
    return this.commentService.getCacheStats();
  }

  @Mutation(() => Boolean, { name: 'clearCommentCache' })
  async clearAllCommentCache() {
    await this.commentService.clearAllCommentCache();
    return true;
  }

  @Mutation(() => Boolean, { name: 'refreshCommentsByPostCache' })
  async refreshCommentsByPostCache(
    @Args('postId', { type: () => Int }) postId: number,
  ) {
    await this.commentService.refreshCommentsByPostCache(postId);
    return true;
  }
}
