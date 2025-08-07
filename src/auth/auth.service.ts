import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { SignUpDto } from 'src/auth/dto/signUp.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

export interface AuthRequest extends Request {
  user: {
    username: string;
    sub: number;
  };
}
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(signInDto.username);

    if (!user) {
      throw new NotFoundException('존재하지 않는 아이디입니다.');
    }

    if (!bcrypt.compareSync(signInDto.password, user.password)) {
      throw new UnauthorizedException();
    }

    // JWT standards
    const payload = { sub: user.id, username: user.username };

    return {
      // generate JWT
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findOne(signUpDto.username);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자입니다.');
    }

    const newUser = await this.usersService.create(signUpDto);

    const payload = { sub: newUser.id, username: newUser.username };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  async getProfile(req: AuthRequest): Promise<User> {
    const username = req.user.username;
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new NotFoundException(
        `${username}에 해당하는 유저를 찾을 수 없습니다.`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;

    return rest as User;
  }
}
