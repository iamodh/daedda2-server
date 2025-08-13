import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthRequest, AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;

  let authService: jest.Mocked<
    Pick<AuthService, 'signIn' | 'signUp' | 'getProfile'>
  >;

  beforeEach(async () => {
    authService = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      getProfile: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const signInDto = {
      username: 'test',
      password: 'testpassword',
    } as SignInDto;

    const token = { access_token: 'mock-jwt-token' };

    it('dto를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      authService.signIn.mockResolvedValue(token);

      await expect(controller.signIn(signInDto)).resolves.toEqual(token);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('register', () => {
    const signUpDto = {
      username: 'test',
      password: 'testpassword',
    } as SignUpDto;
    const token = { access_token: 'mock-jwt-token' };

    it('dto를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      authService.signUp.mockResolvedValue(token);
      await expect(controller.signUp(signUpDto)).resolves.toEqual(token);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });
  describe('profile', () => {
    const req = {
      user: {
        username: 'test',
        sub: 1,
      },
    } as AuthRequest;
    const mockUser = {
      id: 1,
      username: 'test',
    } as User;

    it('dto를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      authService.getProfile.mockResolvedValue(mockUser);
      await expect(controller.getProfile(req)).resolves.toEqual(mockUser);
      expect(authService.getProfile).toHaveBeenCalledWith(req);
    });
  });
});
