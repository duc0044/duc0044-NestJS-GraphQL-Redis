import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './comment.dto';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private commentService: CommentService) {}

  @Mutation(() => Comment)
  createComment(@Args('createCommentInput') input: CreateCommentInput) {
    return this.commentService.create(input);
  }

  @Query(() => [Comment])
  commentsByPost(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentService.findByPost(postId);
  }
}
