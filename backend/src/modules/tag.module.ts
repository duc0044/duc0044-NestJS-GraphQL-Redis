import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from '../services/tag.service';
import { TagResolver } from '../resolvers/tag.resolver';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagService, TagResolver],
  exports: [TagService],
})
export class TagModule {}
