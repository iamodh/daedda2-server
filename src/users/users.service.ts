import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from 'src/auth/dto/signUp.dto';
import { User } from 'src/users/entities/user.entity';
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

    if (username) {
      return await this.usersRepository.findOneBy({ username });
    }

    if (userId) {
      return await this.usersRepository.findOneBy({ id: userId });
    }

    return null;
  }

  async create(signUpDto: SignUpDto): Promise<User> {
    const user = this.usersRepository.create({ ...signUpDto });

    return await this.usersRepository.save(user);
  }
}
