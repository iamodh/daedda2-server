import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { SignUpDto } from '../auth/dto/signUp.dto';
import { UpdateUserDto } from './dto/updateUserDto';

describe('UsersService', () => {
  let service: UsersService;

  type repoMethods = 'findOneBy' | 'create' | 'save' | 'update';
  let mockRepo: jest.Mocked<Pick<Repository<User>, repoMethods>>;

  beforeEach(async () => {
    mockRepo = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const user = {
      id: 1,
      username: 'test',
    } as User;
    it('username에 해당하는 유저의 데이터를 반환해야 한다.', async () => {
      mockRepo.findOneBy.mockResolvedValue(user);
      const result = await service.findOne({ username: 'test' });
      expect(result).toEqual(user);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ username: 'test' });
    });
    it('userId 해당하는 유저의 데이터를 반환해야 한다.', async () => {
      mockRepo.findOneBy.mockResolvedValue(user);
      const result = await service.findOne({ userId: 1 });
      expect(result).toEqual(user);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
    it('해당하는 유저를 찾을 수 없으면 NotFoundException을 던져야 한다.', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne({ userId: 1 })).rejects.toThrow(
        '해당 유저를 찾을 수 없습니다.',
      );
    });
  });
  describe('create', () => {
    const dto = {
      username: 'test',
    } as SignUpDto;

    const created = { username: 'test' } as User;
    const saved = {
      id: 1,
      username: 'test',
    } as User;

    it('새로운 유저를 생성하고 결과를 반환해야 한다.', async () => {
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(result).toEqual(saved);
      expect(mockRepo.create).toHaveBeenCalledWith({ ...dto });
      expect(mockRepo.save).toHaveBeenCalledWith(created);
    });
  });

  describe('update', () => {
    const dto = {
      nickname: 'updated',
    } as UpdateUserDto;

    const result = {
      affected: 1,
    } as UpdateResult;

    it('userId에 해당하는 유저의 데이터를 dto로 수정해야 한다.', async () => {
      mockRepo.update.mockResolvedValue(result);
      await expect(service.update(1, dto)).resolves.toEqual(result);
      expect(mockRepo.update).toHaveBeenCalledWith({ id: 1 }, { ...dto });
    });
  });
});
