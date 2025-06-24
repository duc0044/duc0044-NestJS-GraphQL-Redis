import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../services/user.service';
import { UserResolver } from '../resolvers/user.resolver';
import { User } from '../entities/user.entity';
import { RedisModule } from '../redis/redis.module';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [UserService, UserResolver, JwtStrategy],
  exports: [UserService, JwtModule],
})
export class UserModule {}
