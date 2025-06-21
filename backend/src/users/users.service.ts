import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserInput, UpdateUserInput } from './users.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(user: CreateUserInput): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
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
    return updatedUser;
  }

  async delete(id: number): Promise<User> {
    const deleted = await this.userRepository.delete(id);
    if (deleted.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { id, name: '', email: '', password: '' };
  }
}
