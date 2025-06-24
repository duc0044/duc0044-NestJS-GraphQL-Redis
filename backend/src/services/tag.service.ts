import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagInput, UpdateTagInput } from '../dto/tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagInput: CreateTagInput): Promise<Tag> {
    const { name, slug } = createTagInput;

    // Check if tag already exists
    const existingTag = await this.tagRepository.findOne({
      where: [{ name }, { slug }],
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name or slug already exists');
    }

    const tag = this.tagRepository.create(createTagInput);
    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      relations: ['posts'],
    });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { slug },
      relations: ['posts'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug ${slug} not found`);
    }

    return tag;
  }

  async update(id: number, updateTagInput: UpdateTagInput): Promise<Tag> {
    const tag = await this.findOne(id);
    const { name, slug } = updateTagInput;

    if (name && name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name },
      });
      if (existingTag) {
        throw new ConflictException('Tag name already taken');
      }
    }

    if (slug && slug !== tag.slug) {
      const existingTag = await this.tagRepository.findOne({
        where: { slug },
      });
      if (existingTag) {
        throw new ConflictException('Tag slug already taken');
      }
    }

    Object.assign(tag, updateTagInput);
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<boolean> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return true;
  }
}
