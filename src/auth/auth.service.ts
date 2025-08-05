import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(signInDto.username);

    if (user?.password !== signInDto.password) {
      throw new UnauthorizedException();
    }

    // JWT standards
    const payload = { sub: user.id, username: user.username };

    return {
      // generate JWT
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
