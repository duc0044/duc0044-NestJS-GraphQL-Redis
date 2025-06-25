import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Tag } from '../entities/tag.entity';
import { CreatePostInput, UpdatePostInput } from '../dto/post.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private readonly redisService: RedisService,
  ) { }

  async create(
    createPostInput: CreatePostInput,
    userId: number,
  ): Promise<Post> {
    const { title, slug, content, thumbnail, category_id, tag_ids } =
      createPostInput;

    // Check if post with same slug already exists
    const existingPost = await this.postRepository.findOne({
      where: { slug },
    });

    if (existingPost) {
      throw new ConflictException('Post with this slug already exists');
    }

    const post = this.postRepository.create({
      title,
      slug,
      content,
      thumbnail,
      user_id: userId,
      category_id,
    });

    // Handle tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(tag_ids) });
      post.tags = tags;
    }

    const savedPost = await this.postRepository.save(post);

    // Clear cache after creating new post
    await this.clearCache();

    // Update cache for all posts
    const posts = await this.postRepository.find({
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set('posts:all', this.serializePosts(posts), 300);

    // Update cache for category
    if (category_id) {
      const postsByCategory = await this.postRepository.find({
        where: { category_id },
        relations: ['user', 'category', 'comments', 'tags'],
        order: { created_at: 'DESC' },
      });
      await this.redisService.set(
        `posts:category:${category_id}`,
        this.serializePosts(postsByCategory),
        300,
      );
    }

    // Update cache for user
    const postsByUser = await this.postRepository.find({
      where: { user_id: userId },
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set(
      `posts:user:${userId}`,
      this.serializePosts(postsByUser),
      300,
    );

    return savedPost;
  }

  async findAll(): Promise<Post[]> {
    // Try to get from cache first
    const cacheKey = 'posts:all';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post[];
    }

    const posts = await this.postRepository.find({
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, this.serializePosts(posts), 300);

    return posts;
  }

  async findOne(id: number): Promise<Post> {
    // Try to get from cache first
    const cacheKey = `post:${id}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post;
    }

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'comments', 'tags'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, this.serializePost(post), 300);

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    // Try to get from cache first
    const cacheKey = `post:slug:${slug}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post;
    }

    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['user', 'category', 'comments', 'tags'],
    });

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, this.serializePost(post), 300);

    return post;
  }

  async findByCategory(categoryId: number): Promise<Post[]> {
    const cacheKey = `posts:category:${categoryId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post[];
    }

    const posts = await this.postRepository.find({
      where: { category_id: categoryId },
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, this.serializePosts(posts), 300);

    return posts;
  }

  async findByUser(userId: number): Promise<Post[]> {
    const cacheKey = `posts:user:${userId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post[];
    }

    const posts = await this.postRepository.find({
      where: { user_id: userId },
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, this.serializePosts(posts), 300);

    return posts;
  }

  async update(id: number, updatePostInput: UpdatePostInput): Promise<Post> {
    const post = await this.findOne(id);
    const { title, slug, content, thumbnail, category_id, tag_ids } =
      updatePostInput;

    if (slug && slug !== post.slug) {
      const existingPost = await this.postRepository.findOne({
        where: { slug },
      });
      if (existingPost) {
        throw new ConflictException('Post slug already taken');
      }
    }

    if (title) post.title = title;
    if (slug) post.slug = slug;
    if (content) post.content = content;
    if (thumbnail) post.thumbnail = thumbnail;
    if (category_id !== undefined) post.category_id = category_id;

    // Handle tags if provided
    if (tag_ids !== undefined) {
      if (tag_ids.length > 0) {
        const tags = await this.tagRepository.findBy({ id: In(tag_ids) });
        post.tags = tags;
      } else {
        post.tags = [];
      }
    }

    const updatedPost = await this.postRepository.save(post);

    // Clear cache after update
    await this.clearCache();

    // Update cache for the specific post
    const freshPost = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'comments', 'tags'],
    });

    if (freshPost) {
      await this.redisService.set(
        `post:${id}`,
        this.serializePost(freshPost),
        300,
      );

      // Update cache for slug if it changed
      if (slug && slug !== post.slug) {
        await this.redisService.set(
          `post:slug:${slug}`,
          this.serializePost(freshPost),
          300,
        );
        // Remove old slug cache
        await this.redisService.del(`post:slug:${post.slug}`);
      }
    }

    // Update cache for all posts
    const posts = await this.postRepository.find({
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set('posts:all', this.serializePosts(posts), 300);

    // Update cache for category
    if (category_id !== undefined) {
      const postsByCategory = await this.postRepository.find({
        where: { category_id },
        relations: ['user', 'category', 'comments', 'tags'],
        order: { created_at: 'DESC' },
      });
      await this.redisService.set(
        `posts:category:${category_id}`,
        this.serializePosts(postsByCategory),
        300,
      );
    }

    // Update cache for user
    const postsByUser = await this.postRepository.find({
      where: { user_id: post.user_id },
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set(
      `posts:user:${post.user_id}`,
      this.serializePosts(postsByUser),
      300,
    );

    return updatedPost;
  }

  async remove(id: number): Promise<boolean> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);

    // Clear cache after deletion
    await this.clearCache();

    // Update cache for all posts
    const posts = await this.postRepository.find({
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set('posts:all', this.serializePosts(posts), 300);

    // Update cache for category
    if (post.category_id) {
      const postsByCategory = await this.postRepository.find({
        where: { category_id: post.category_id },
        relations: ['user', 'category', 'comments', 'tags'],
        order: { created_at: 'DESC' },
      });
      await this.redisService.set(
        `posts:category:${post.category_id}`,
        this.serializePosts(postsByCategory),
        300,
      );
    }

    // Update cache for user
    const postsByUser = await this.postRepository.find({
      where: { user_id: post.user_id },
      relations: ['user', 'category', 'comments', 'tags'],
      order: { created_at: 'DESC' },
    });
    await this.redisService.set(
      `posts:user:${post.user_id}`,
      this.serializePosts(postsByUser),
      300,
    );

    return true;
  }

  async searchPosts(query: string): Promise<Post[]> {
    const cacheKey = `posts:search:${query}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Post[];
    }

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.title LIKE :query OR post.content LIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('post.created_at', 'DESC')
      .getMany();

    // Cache search results for 2 minutes (shorter TTL for search)
    await this.redisService.set(cacheKey, this.serializePosts(posts), 120);

    return posts;
  }

  private async clearCache(): Promise<void> {
    const keys = await this.redisService.keys('post:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  private serializePost(post: Post): string {
    return JSON.stringify(post, (key: string, value: unknown) => {
      // Handle circular references
      if (key === 'posts' && typeof value === 'object') {
        return undefined; // Skip posts array to avoid circular reference
      }
      return value;
    });
  }

  private serializePosts(posts: Post[]): string {
    return JSON.stringify(posts, (key: string, value: unknown) => {
      // Handle circular references
      if (key === 'posts' && typeof value === 'object') {
        return undefined; // Skip posts array to avoid circular reference
      }
      return value;
    });
  }
}
