import { Test, TestingModule } from '@nestjs/testing';
import { AuthRequest, AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';

jest.mock('bcrypt', () => ({ compareSync: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findOne' | 'create'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto = {
      username: 'test',
      password: 'testpassword',
    } as SignInDto;
    const mockUser = {
      id: 1,
      username: 'test',
      password: 'hashedpassword', // 실제로는 해싱된 비밀번호
    } as User;

    it('유저 정보가 일치하면 access_token을 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      const mockToken = 'mock-jwt-token';
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signIn(signInDto);

      expect(usersService.findOne).toHaveBeenCalledWith({
        username: signInDto.username,
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('username에 해당하는 유저 정보가 없으면 NotFoundException을 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(service.signIn(signInDto)).rejects.toThrow(
        new NotFoundException('존재하지 않는 아이디입니다.'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('비밀번호가 일치하지 않으면 UnauthorizedException을 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('비밀번호가 일치하지 않습니다.'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    const signUpDto = {
      username: 'test',
      password: 'testpassword',
    } as SignUpDto;
    const mockUser = {
      id: 1,
      username: 'test',
      password: 'hashedpassword',
    } as User;
    it('새로운 유저를 생성하고 access_token을 반환해야 한다.', async () => {
      const mockToken = 'mock-jwt-token';
      usersService.findOne.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signUp(signUpDto);
      expect(usersService.findOne).toHaveBeenCalledWith({
        username: signUpDto.username,
      });
      expect(usersService.create).toHaveBeenCalledWith(signUpDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({ access_token: mockToken });
    });
    it('username이 중복되면 ConflictException을 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        new ConflictException('이미 존재하는 사용자입니다.'),
      );
      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    const req = {
      user: {
        username: 'test',
        sub: 1,
      },
    } as AuthRequest;

    const mockUser = {
      id: 1,
      username: 'test',
      password: 'hashedpassword',
    } as User;

    it('username과 일치하는 유저 정보에서 비밀번호를 제외한 데이터를 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      const result = await service.getProfile(req);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
      expect(usersService.findOne).toHaveBeenCalledWith({
        username: req.user.username,
      });
    });
    it('해당하는 username이 없다면 NotFoundException을 반환해야 한다.', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(service.getProfile(req)).rejects.toThrow(
        new NotFoundException('test에 해당하는 유저를 찾을 수 없습니다.'),
      );
    });
  });
});
