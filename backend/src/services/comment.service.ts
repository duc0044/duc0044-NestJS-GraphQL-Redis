import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentInput, UpdateCommentInput } from '../dto/comment.dto';
import { RedisService } from '../redis/redis.service';
import { Between } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private redisService: RedisService,
  ) { }

  private getCacheKey(method: string, id?: number): string {
    return `comment:${method}${id ? `:${id}` : ''}`;
  }

  private async invalidateCommentCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys('comment:*');
      if (keys.length > 0) {
        await this.redisService.del(...keys);
        console.log(`🗑️ Invalidated ${keys.length} comment cache keys`);
      }
    } catch (error) {
      console.error('Error invalidating comment cache:', error);
    }
  }

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const comment = this.commentRepository.create(createCommentInput);
    const savedComment = await this.commentRepository.save(comment);

    // Invalidate all comment-related cache after creating new comment
    await this.invalidateCommentCache();

    // Also cache the newly created comment for immediate access
    const cacheKey = this.getCacheKey('findOne', savedComment.id);
    await this.redisService.set(cacheKey, JSON.stringify(savedComment), 600);

    // Force refresh the findByPost cache for this specific post
    await this.refreshCommentsByPostCache(savedComment.post_id);

    console.log(`✅ Created comment ${savedComment.id} and invalidated cache`);

    return savedComment;
  }

  async findAll(): Promise<Comment[]> {
    const cacheKey = this.getCacheKey('findAll');

    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT for ${cacheKey}`);
      return JSON.parse(cached) as Comment[];
    }

    console.log(`📦 Cache MISS for ${cacheKey}`);

    // If not in cache, get from database
    const comments = await this.commentRepository.find({
      relations: ['user', 'post'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 300);
    console.log(`💾 Cached ${comments.length} comments for 5 minutes`);

    return comments;
  }

  async findOne(id: number): Promise<Comment> {
    const cacheKey = this.getCacheKey('findOne', id);

    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT for ${cacheKey}`);
      return JSON.parse(cached) as Comment;
    }

    console.log(`📦 Cache MISS for ${cacheKey}`);

    // If not in cache, get from database
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Cache the result for 10 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comment), 600);
    console.log(`💾 Cached comment ${id} for 10 minutes`);

    return comment;
  }

  async findByPost(postId: number): Promise<Comment[]> {
    const cacheKey = this.getCacheKey('findByPost', postId);

    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT for ${cacheKey}`);
      return JSON.parse(cached) as Comment[];
    }

    console.log(`📦 Cache MISS for ${cacheKey}`);

    // If not in cache, get from database
    const comments = await this.commentRepository.find({
      where: { post_id: postId },
      relations: ['user', 'post'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 300);

    return comments;
  }

  async findByUser(userId: number): Promise<Comment[]> {
    const cacheKey = this.getCacheKey('findByUser', userId);

    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT for ${cacheKey}`);
      return JSON.parse(cached) as Comment[];
    }

    // If not in cache, get from database
    const comments = await this.commentRepository.find({
      where: { user_id: userId },
      relations: ['post'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 300);

    return comments;
  }

  async update(
    id: number,
    updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    // Get comment directly from database to avoid cache issues
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    Object.assign(comment, updateCommentInput);
    const updatedComment = await this.commentRepository.save(comment);

    // Invalidate all comment-related cache after updating
    await this.invalidateCommentCache();

    // Also cache the updated comment for immediate access
    const cacheKey = this.getCacheKey('findOne', updatedComment.id);
    await this.redisService.set(cacheKey, JSON.stringify(updatedComment), 600);

    console.log(`✅ Updated comment ${id} and invalidated cache`);

    return updatedComment;
  }

  async remove(id: number): Promise<boolean> {
    // Get comment directly from database to avoid cache issues
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentRepository.remove(comment);

    // Invalidate all comment-related cache after removing
    await this.invalidateCommentCache();

    console.log(`✅ Removed comment ${id} and invalidated cache`);

    return true;
  }

  // Helper method to manually clear all comment cache (for testing/debugging)
  async clearAllCommentCache(): Promise<void> {
    await this.invalidateCommentCache();
  }

  // Helper method to get cache statistics
  async getCacheStats(): Promise<{ totalKeys: number; keys: string[] }> {
    try {
      const keys = await this.redisService.keys('comment:*');
      return {
        totalKeys: keys.length,
        keys: keys,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalKeys: 0, keys: [] };
    }
  }

  // Helper method to force refresh cache for a specific comment
  async refreshCommentCache(commentId: number): Promise<void> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['user', 'post'],
      });

      if (comment) {
        const cacheKey = this.getCacheKey('findOne', commentId);
        await this.redisService.set(cacheKey, JSON.stringify(comment), 600);
        console.log(`🔄 Refreshed cache for comment ${commentId}`);
      }
    } catch (error) {
      console.error(`Error refreshing cache for comment ${commentId}:`, error);
    }
  }

  // Get recent comments (last N comments)
  async getRecentComments(limit: number = 10): Promise<Comment[]> {
    const cacheKey = this.getCacheKey('recent', limit);

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Comment[];
    }

    const comments = await this.commentRepository.find({
      relations: ['user', 'post'],
      order: { created_at: 'DESC' },
      take: limit,
    });

    // Cache recent comments for 3 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 180);

    return comments;
  }

  // Search comments by content
  async searchComments(searchTerm: string): Promise<Comment[]> {
    const cacheKey = this.getCacheKey(
      'search',
      searchTerm.length > 20
        ? searchTerm.substring(0, 20).length
        : searchTerm.length,
    );

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Comment[];
    }

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.content LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('comment.created_at', 'DESC')
      .getMany();

    // Cache search results for 2 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 120);

    return comments;
  }

  // Get comments by date range
  async getCommentsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Comment[]> {
    const cacheKey = this.getCacheKey(
      'dateRange',
      Math.floor((startDate.getTime() + endDate.getTime()) / 2),
    );

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Comment[];
    }

    const comments = await this.commentRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      relations: ['user', 'post'],
      order: { created_at: 'DESC' },
    });

    // Cache date range results for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(comments), 300);

    return comments;
  }

  // Helper method to force refresh cache for a specific post
  async refreshCommentsByPostCache(postId: number): Promise<void> {
    try {
      const comments = await this.commentRepository.find({
        where: { post_id: postId },
        relations: ['user', 'post'],
        order: { created_at: 'DESC' },
      });

      if (comments.length > 0) {
        const cacheKey = this.getCacheKey('findByPost', postId);
        await this.redisService.set(cacheKey, JSON.stringify(comments), 300);
        console.log(`🔄 Refreshed cache for post ${postId}`);
      }
    } catch (error) {
      console.error(`Error refreshing cache for post ${postId}:`, error);
    }
  }
}
