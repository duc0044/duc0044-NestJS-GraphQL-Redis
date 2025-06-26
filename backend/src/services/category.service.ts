import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryInput, UpdateCategoryInput } from '../dto/category.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly redisService: RedisService,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    const { name, slug } = createCategoryInput;

    // Check if category already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: [{ name }, { slug }],
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category with this name or slug already exists',
      );
    }

    const category = this.categoryRepository.create(createCategoryInput);
    const savedCategory = await this.categoryRepository.save(category);

    // Update cache with new category data
    await this.updateCache(savedCategory);

    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    // Try to get from cache first
    const cacheKey = 'categories:all';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Category[];
    }

    // If not in cache, get from database
    const categories = await this.categoryRepository.find({
      relations: ['posts'],
    });

    // Cache the result for 5 minutes
    await this.redisService.set(
      'categories:all',
      JSON.stringify(categories),
      300,
    );

    return categories;
  }

  async findOne(id: number): Promise<Category> {
    // Try to get from cache first
    const cacheKey = `category:${id}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Category;
    }

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(category), 300);

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    // Try to get from cache first
    const cacheKey = `category:slug:${slug}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Category;
    }

    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['posts'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(category), 300);

    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    const category = await this.findOne(id);
    const { name, slug } = updateCategoryInput;

    if (name && name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name },
      });
      if (existingCategory) {
        throw new ConflictException('Category name already taken');
      }
    }

    if (slug && slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug },
      });
      if (existingCategory) {
        throw new ConflictException('Category slug already taken');
      }
    }

    Object.assign(category, updateCategoryInput);
    const updatedCategory = await this.categoryRepository.save(category);

    // Update cache with updated category data
    await this.updateCache(updatedCategory);

    return updatedCategory;
  }

  async remove(id: number): Promise<boolean> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    // Update cache after deletion - refresh the categories list
    await this.refreshCategoriesCache();

    return true;
  }

  private async updateCache(category: Category): Promise<void> {
    // Update individual category cache
    const categoryKey = `category:${category.id}`;
    const slugKey = `category:slug:${category.slug}`;

    await this.redisService.set(categoryKey, JSON.stringify(category), 300);
    await this.redisService.set(slugKey, JSON.stringify(category), 300);

    // Update categories list cache
    const allCategories = await this.categoryRepository.find({
      relations: ['posts'],
    });
    await this.redisService.set(
      'categories:all',
      JSON.stringify(allCategories),
      300,
    );
  }

  private async refreshCategoriesCache(): Promise<void> {
    // Get fresh categories list from database
    const allCategories = await this.categoryRepository.find({
      relations: ['posts'],
    });

    // Update the categories list cache
    await this.redisService.set(
      'categories:all',
      JSON.stringify(allCategories),
      300,
    );
  }

  private async clearCache(): Promise<void> {
    const keys = await this.redisService.keys('category:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
