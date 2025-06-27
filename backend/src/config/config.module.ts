import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { redisConfig } from './redis.config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

// Import entities
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: configService.get('database.type') as 'mysql',
          host: configService.get('database.host') as string,
          port: configService.get('database.port') as number,
          username: configService.get('database.username') as string,
          password: configService.get('database.password') as string,
          database: configService.get('database.database') as string,
          entities: [User, Category, Post, Comment, Tag],
          synchronize: true,
          logging: true,
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: false,
      debug: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      sortSchema: true,
      subscriptions: { 'graphql-ws': true },
    }),
  ],
})
export class AppConfigModule {
  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get('database.host'));
  }
}
