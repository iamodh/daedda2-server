import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

type MockReq = { headers: { authorization?: string }; user?: any };

const makeContext = (authHeader?: string) => {
  const req: MockReq = {
    headers: authHeader ? { authorization: authHeader } : {},
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as ExecutionContext;

  return { req, context };
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };

    configService.get.mockReturnValue('secret-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('토큰 검증에 성공하면 request에 user를 주입하고 true를 반환한다.', async () => {
    const payload = { sub: 1, username: 'neo', iat: 1, exp: 2 };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const { context, req } = makeContext('Bearer goodtoken');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user).toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('goodtoken', {
      secret: 'secret-key',
    });
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET_KEY');
  });

  it('Authorization 헤더가 없으면 UnauthorizedException을 반환한다.', async () => {
    const { context } = makeContext();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('헤더 인증 방식이 Bearer가 아니면 UnauthorizedException을 반환한다.', async () => {
    const { context } = makeContext('Basic abc');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('토큰이 비어 있으면 UnauthorizedException을 반환한다.', async () => {
    const { context } = makeContext('Bearer');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('토큰 검증에 실패하면 UnauthorizedException을 반환한다.', async () => {
    // mock 함수 결과를 실패로 설정
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

    const { context } = makeContext('Bearer xxx');
    // 내부에서 검증을 위해 mock 함수 사용
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
