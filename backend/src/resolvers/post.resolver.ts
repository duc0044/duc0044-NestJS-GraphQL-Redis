import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Post } from '../entities/post.entity';
import { CreatePostInput, UpdatePostInput } from '../dto/post.dto';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    return this.postService.create(createPostInput, user.id);
  }

  @Query(() => [Post], { name: 'posts' })
  async findAll() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.postService.findOne(id);
  }

  @Query(() => Post, { name: 'postBySlug' })
  async findBySlug(@Args('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Query(() => [Post], { name: 'postsByCategory' })
  async findByCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ) {
    return this.postService.findByCategory(categoryId);
  }

  @Query(() => [Post], { name: 'postsByUser' })
  async findByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.postService.findByUser(userId);
  }

  @Query(() => [Post], { name: 'myPosts' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async findMyPosts(@CurrentUser() user: User) {
    return this.postService.findByUser(user.id);
  }

  @Query(() => [Post], { name: 'searchPosts' })
  async searchPosts(@Args('query') query: string) {
    return this.postService.searchPosts(query);
  }

  @Mutation(() => Post)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @CurrentUser() user: User,
  ) {
    // Check if user owns the post or is admin
    const post = await this.postService.findOne(id);
    if (post.user_id !== user.id && user.role !== UserRole.ADMIN) {
      throw new Error('You can only update your own posts');
    }
    return this.postService.update(id, updatePostInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async removePost(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    // Check if user owns the post or is admin
    const post = await this.postService.findOne(id);
    if (post.user_id !== user.id && user.role !== UserRole.ADMIN) {
      throw new Error('You can only delete your own posts');
    }
    return this.postService.remove(id);
  }
}
