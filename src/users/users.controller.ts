import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: number): Promise<User | null> {
    return this.usersService.findOne({ userId });
  }
}
