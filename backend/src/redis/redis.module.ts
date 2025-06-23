import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { RedisResolver } from './redis.resolver';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
          keyPrefix: configService.get('redis.keyPrefix'),
        });
      },
      inject: [ConfigService],
    },
    RedisService,
    RedisResolver,
  ],
  exports: [RedisService],
})
export class RedisModule {}
