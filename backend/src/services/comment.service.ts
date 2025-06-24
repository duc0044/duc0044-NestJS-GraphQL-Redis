import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentInput, UpdateCommentInput } from '../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const comment = this.commentRepository.create(createCommentInput);
    return this.commentRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['user', 'post'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async findByPost(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { post_id: postId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { user_id: userId },
      relations: ['post'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentInput);
    return this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<boolean> {
    const comment = await this.findOne(id);
    await this.commentRepository.remove(comment);
    return true;
  }
}
