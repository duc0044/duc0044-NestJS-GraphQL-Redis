import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TagService } from '../services/tag.service';
import { Tag } from '../entities/tag.entity';
import { CreateTagInput, UpdateTagInput } from '../dto/tag.dto';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Mutation(() => Tag)
  async createTag(@Args('createTagInput') createTagInput: CreateTagInput) {
    return this.tagService.create(createTagInput);
  }

  @Query(() => [Tag], { name: 'tags' })
  async findAll() {
    return this.tagService.findAll();
  }

  @Query(() => Tag, { name: 'tag' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.findOne(id);
  }

  @Query(() => Tag, { name: 'tagBySlug' })
  async findBySlug(@Args('slug') slug: string) {
    return this.tagService.findBySlug(slug);
  }

  @Mutation(() => Tag)
  async updateTag(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateTagInput') updateTagInput: UpdateTagInput,
  ) {
    return this.tagService.update(id, updateTagInput);
  }

  @Mutation(() => Boolean)
  async removeTag(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.remove(id);
  }
}
