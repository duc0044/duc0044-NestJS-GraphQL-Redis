import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RedisService } from './redis.service';

@Resolver()
export class RedisResolver {
  constructor(private readonly redisService: RedisService) {}

  @Query(() => String)
  async redisPing(): Promise<string> {
    return await this.redisService.ping();
  }

  @Query(() => String, { nullable: true })
  async getCache(@Args('key') key: string): Promise<string | null> {
    return await this.redisService.get(key);
  }

  @Mutation(() => String)
  async setCache(
    @Args('key') key: string,
    @Args('value') value: string,
    @Args('ttl', { nullable: true }) ttl?: number,
  ): Promise<string> {
    await this.redisService.set(key, value, ttl);
    return 'OK';
  }

  @Mutation(() => Number)
  async deleteCache(@Args('key') key: string): Promise<number> {
    return await this.redisService.del(key);
  }

  @Query(() => [String])
  async getKeys(@Args('pattern') pattern: string): Promise<string[]> {
    return await this.redisService.keys(pattern);
  }

  @Mutation(() => String)
  async clearAllCache(): Promise<string> {
    await this.redisService.flushdb();
    return 'All cache cleared';
  }

  @Query(() => Number)
  async getTtl(@Args('key') key: string): Promise<number> {
    return await this.redisService.ttl(key);
  }

  @Mutation(() => Number)
  async setExpire(
    @Args('key') key: string,
    @Args('seconds') seconds: number,
  ): Promise<number> {
    return await this.redisService.expire(key, seconds);
  }
}
