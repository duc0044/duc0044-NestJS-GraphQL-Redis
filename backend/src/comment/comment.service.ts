import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './comment.dto';
import { Post } from '../posts/post.entity';
import { User } from '../users/users.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(input: CreateCommentInput): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: input.postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    const author = await this.userRepository.findOne({
      where: { id: input.authorId },
    });
    if (!author) throw new NotFoundException('User not found');
    const comment = this.commentRepository.create({
      content: input.content,
      post,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async findByPost(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author', 'post'],
      order: { createdAt: 'DESC' },
    });
  }
}
