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

  async findOne(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ username });

    console.log(user);

    return user;
  }

  async create(signUpDto: SignUpDto): Promise<User> {
    const user = this.usersRepository.create({ ...signUpDto });

    return await this.usersRepository.save(user);
  }
}
