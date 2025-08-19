import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '../auth/dto/signUp.dto';
import { UpdateUserDto } from './dto/updateUserDto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(identifier: {
    username?: string;
    userId?: number;
  }): Promise<User | null> {
    const { username, userId } = identifier;

    let result: User | null = null;

    if (username) {
      result = await this.usersRepository.findOneBy({ username });
    }

    if (userId) {
      result = await this.usersRepository.findOneBy({ id: userId });
    }

    return result;
  }

  async create(signUpDto: SignUpDto): Promise<User> {
    const user = this.usersRepository.create({ ...signUpDto });

    return await this.usersRepository.save(user);
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const result = await this.usersRepository.update(
      { id: userId },
      {
        ...updateUserDto,
      },
    );

    return result;
  }
}
