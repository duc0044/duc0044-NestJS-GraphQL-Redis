import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { RedisService } from '../redis/redis.service';
import { CreatePostInput, UpdatePostInput } from './dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private redisService: RedisService,
  ) { }

  private getCacheKey(id: number): string {
    return `post:${id}`;
  }

  private getPostsListKey(): string {
    return 'posts:list';
  }

  private getPostsByUserKey(userId: number): string {
    return `posts:user:${userId}`;
  }

  async findAll(): Promise<Post[]> {
    // Try to get from cache first
    const cachedPosts = await this.redisService.get(this.getPostsListKey());
    if (cachedPosts) {
      return JSON.parse(cachedPosts) as Post[];
    }

    // If not in cache, get from database
    const posts = await this.postRepository.find({
      relations: ['author', 'comments'],
    });

    // Cache the result for 5 minutes
    await this.redisService.set(
      this.getPostsListKey(),
      JSON.stringify(posts),
      300,
    );

    return posts;
  }

  async findOne(id: number): Promise<Post> {
    // Try to get from cache first
    const cacheKey = this.getCacheKey(id);
    const cachedPost = await this.redisService.get(cacheKey);
    if (cachedPost) {
      return JSON.parse(cachedPost) as Post;
    }

    // If not in cache, get from database
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Cache the post for 10 minutes
    await this.redisService.set(cacheKey, JSON.stringify(post), 600);

    return post;
  }

  async findByUser(userId: number): Promise<Post[]> {
    // Try to get from cache first
    const cacheKey = this.getPostsByUserKey(userId);
    const cachedPosts = await this.redisService.get(cacheKey);
    if (cachedPosts) {
      return JSON.parse(cachedPosts) as Post[];
    }

    // If not in cache, get from database
    const posts = await this.postRepository.find({
      where: { author: { id: userId } },
      relations: ['author', 'comments'],
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(posts), 300);

    return posts;
  }

  async create(createPostInput: CreatePostInput): Promise<Post> {
    const { authorId, ...postData } = createPostInput;
    // Lấy user đầy đủ từ DB
    const author = await this.postRepository.manager
      .getRepository('User')
      .findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');
    const newPost = this.postRepository.create({
      ...postData,
      author,
    });
    const savedPost = await this.postRepository.save(newPost);

    // Invalidate caches
    await this.redisService.del(this.getPostsListKey());
    await this.redisService.del(this.getPostsByUserKey(authorId));

    // Trả về post đã populate author
    const fullPost = await this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['author', 'comments'],
    });
    if (!fullPost) throw new NotFoundException('Post not found after creation');
    return fullPost;
  }

  async update(id: number, updatePostInput: UpdatePostInput): Promise<Post> {
    const { authorId, ...postData } = updatePostInput;
    const updatePayload = {
      ...postData,
      ...(authorId && { author: { id: authorId } }),
    };

    const updated = await this.postRepository.update(id, updatePayload);
    if (updated.affected === 0) {
      throw new NotFoundException('Post not found');
    }

    const updatedPost = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });
    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }

    // Update cache
    const cacheKey = this.getCacheKey(id);
    await this.redisService.set(cacheKey, JSON.stringify(updatedPost), 600);

    // Invalidate list caches
    await this.redisService.del(this.getPostsListKey());
    await this.redisService.del(this.getPostsByUserKey(updatedPost.author.id));

    return updatedPost;
  }

  async delete(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const deleted = await this.postRepository.delete(id);
    if (deleted.affected === 0) {
      throw new NotFoundException('Post not found');
    }

    // Remove from cache
    const cacheKey = this.getCacheKey(id);
    await this.redisService.del(cacheKey);

    // Invalidate list caches
    await this.redisService.del(this.getPostsListKey());
    await this.redisService.del(this.getPostsByUserKey(post.author.id));

    return post;
  }

  async clearCache(): Promise<void> {
    // Clear all post-related cache
    const postKeys = await this.redisService.keys('post:*');
    const postsListKeys = await this.redisService.keys('posts:list');
    const postsUserKeys = await this.redisService.keys('posts:user:*');

    const allKeys = [...postKeys, ...postsListKeys, ...postsUserKeys];

    if (allKeys.length > 0) {
      await this.redisService.del(...allKeys);
    }
  }
}
