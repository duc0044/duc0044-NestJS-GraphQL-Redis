import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserInput, UpdateUserInput, LoginInput } from '../dto/user.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const { username, email, password, role } = createUserInput;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
        {
          cause: {
            code: 'USER_ALREADY_EXISTS',
            message: 'User with this email or username already exists',
          },
        },
      );
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      username,
      email,
      password_hash,
      role: role || UserRole.USER, // Default to USER role
    });

    const savedUser = await this.userRepository.save(user);

    // Clear user cache after creating new user
    await this.clearUserCache();

    // Clear users:all cache after creating new user
    await this.redisService.del('users:all');

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    // Try to get from cache first
    const cacheKey = 'users:all';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as User[];
    }

    const users = await this.userRepository.find({
      relations: ['posts', 'comments'],
    });

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(users), 300);

    return users;
  }

  async findOne(id: number): Promise<User> {
    // Try to get from cache first
    const cacheKey = `user:${id}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as User;
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the result for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(user), 300);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Try to get from cache first
    const cacheKey = `user:email:${email}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as User;
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      // Cache the result for 5 minutes
      await this.redisService.set(cacheKey, JSON.stringify(user), 300);
    }

    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    // Get user directly from database to avoid cache issues
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { username, email, password, role } = updateUserInput;

    if (username && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new ConflictException('Username already taken');
      }
    }

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already taken');
      }
    }

    if (password) {
      const saltRounds = 10;
      user.password_hash = await bcrypt.hash(password, saltRounds);
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    const updatedUser = await this.userRepository.save(user);

    // Clear specific user cache and update with new data
    await this.clearSpecificUserCache(id, user.email);

    // Update cache with new user data
    const userCacheKey = `user:${id}`;
    const emailCacheKey = `user:email:${user.email}`;
    await this.redisService.set(userCacheKey, JSON.stringify(updatedUser), 300);
    await this.redisService.set(
      emailCacheKey,
      JSON.stringify(updatedUser),
      300,
    );

    // Clear the all users cache since it might contain the old data
    await this.redisService.del('users:all');

    return updatedUser;
  }

  async remove(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    // Clear specific user cache before deletion
    await this.clearSpecificUserCache(id, user.email);
    await this.userRepository.remove(user);

    // Clear all user cache after deletion
    await this.clearUserCache();

    // Clear users:all cache after deletion
    await this.redisService.del('users:all');

    return true;
  }

  async validateUser(loginInput: LoginInput): Promise<User> {
    const { email, password } = loginInput;
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return user;
  }

  async login(loginInput: LoginInput): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(loginInput);

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    );

    return { user, token };
  }

  // async refreshToken(userId: number): Promise<string> {
  //   const user = await this.findOne(userId);
  //   const payload = {
  //     sub: user.id,
  //     email: user.email,
  //     role: user.role,
  //   };
  //   const token = jwt.sign(
  //     payload,
  //     process.env.JWT_SECRET || 'your-secret-key',
  //     { expiresIn: '1h' },
  //   );
  //   return token;
  // }

  // Role-based methods
  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.findOne(userId);
    return user.role === UserRole.ADMIN;
  }

  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    user.role = UserRole.ADMIN;

    const updatedUser = await this.userRepository.save(user);
    await this.clearUserCache();

    return updatedUser;
  }

  async demoteToUser(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    user.role = UserRole.USER;

    const updatedUser = await this.userRepository.save(user);
    await this.clearUserCache();

    return updatedUser;
  }

  // Session management methods
  async createSession(
    userId: number,
    sessionData: Record<string, unknown>,
  ): Promise<string> {
    const sessionId = `session:${userId}:${Date.now()}`;
    await this.redisService.set(sessionId, JSON.stringify(sessionData), 3600); // 1 hour TTL
    return sessionId;
  }

  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const sessionData = await this.redisService.get(sessionId);
    return sessionData
      ? (JSON.parse(sessionData) as Record<string, unknown>)
      : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del(sessionId);
  }

  private async clearUserCache(): Promise<void> {
    const keys = await this.redisService.keys('user:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  private async clearSpecificUserCache(
    userId: number,
    email: string,
  ): Promise<void> {
    const userCacheKey = `user:${userId}`;
    const emailCacheKey = `user:email:${email}`;
    await this.redisService.del(userCacheKey, emailCacheKey);
  }
}
