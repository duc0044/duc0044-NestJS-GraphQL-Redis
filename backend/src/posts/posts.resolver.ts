import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { CreatePostInput, UpdatePostInput } from './dto/posts.dto';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) { }

  @Query(() => [Post])
  posts() {
    return this.postsService.findAll();
  }

  @Query(() => Post, { nullable: true })
  post(@Args('id') id: number) {
    return this.postsService.findOne(id);
  }

  @Mutation(() => Post)
  createPost(@Args('createPostInput') input: CreatePostInput) {
    return this.postsService.create(input);
  }

  @Mutation(() => Post)
  updatePost(@Args('updatePostInput') input: UpdatePostInput) {
    return this.postsService.update(input.id, input);
  }

  @Mutation(() => Post)
  deletePost(@Args('id') id: number) {
    return this.postsService.delete(id);
  }
}
