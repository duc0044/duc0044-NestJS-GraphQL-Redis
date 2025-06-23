import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserInput, UpdateUserInput } from './dto/users.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) { }

  private getCacheKey(id: number): string {
    return `user:${id}`;
  }

  private getUsersListKey(): string {
    return 'users:list';
  }

  async findAll(): Promise<User[]> {
    // Try to get from cache first
    const cachedUsers = await this.redisService.get(this.getUsersListKey());
    if (cachedUsers) {
      return JSON.parse(cachedUsers) as User[];
    }

    // If not in cache, get from database
    const users = await this.userRepository.find();

    // Cache the result for 5 minutes
    await this.redisService.set(
      this.getUsersListKey(),
      JSON.stringify(users),
      300,
    );

    return users;
  }

  async findOne(id: number): Promise<User | null> {
    // Try to get from cache first
    const cacheKey = this.getCacheKey(id);
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser) as User;
    }

    // If not in cache, get from database
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    // Cache the user for 10 minutes
    await this.redisService.set(cacheKey, JSON.stringify(user), 600);

    return user;
  }

  async create(user: CreateUserInput): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);

    // Invalidate users list cache
    await this.redisService.del(this.getUsersListKey());

    return savedUser;
  }

  async update(id: number, user: UpdateUserInput): Promise<User> {
    const updated = await this.userRepository.update(id, user);
    if (updated.affected === 0) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Update cache
    const cacheKey = this.getCacheKey(id);
    await this.redisService.set(cacheKey, JSON.stringify(updatedUser), 600);

    // Invalidate users list cache
    await this.redisService.del(this.getUsersListKey());

    return updatedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    // We don't cache by email directly to avoid complexity,
    // but this lookup is essential for auth.
    return this.userRepository.findOne({ where: { email } });
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deleted = await this.userRepository.delete(id);
    if (deleted.affected === 0) {
      throw new NotFoundException('User not found');
    }

    // Remove from cache
    const cacheKey = this.getCacheKey(id);
    await this.redisService.del(cacheKey);

    // Invalidate users list cache
    await this.redisService.del(this.getUsersListKey());

    return user;
  }

  async clearCache(): Promise<void> {
    // Clear all user-related cache
    const keys = await this.redisService.keys('user:*');
    const listKeys = await this.redisService.keys('users:list');

    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
    if (listKeys.length > 0) {
      await this.redisService.del(...listKeys);
    }
  }
}
