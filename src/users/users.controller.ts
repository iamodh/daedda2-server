import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUserDto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateResult } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: number): Promise<User | null> {
    return this.usersService.findOne({ userId });
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.update(userId, updateUserDto);
  }
}
