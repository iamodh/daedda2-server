import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateUserDto';
import { UpdateResult } from 'typeorm';

describe('UsersController', () => {
  let controller: UsersController;

  let usersService: jest.Mocked<Pick<UsersService, 'findOne' | 'update'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    usersService = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    const user = {
      id: 1,
      username: 'test',
      nickname: 'testnickname',
    } as User;

    it('userId를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      usersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);
      expect(result).toEqual(user);
      expect(usersService.findOne).toHaveBeenCalledWith({
        userId: 1,
      });
    });
  });
  describe('update', () => {
    const dto = {
      username: 'updated',
      nickname: 'updatednickname',
    } as unknown as UpdateUserDto;

    const result = { affected: 1 } as UpdateResult;

    it('userId와 dto를 서비스에 전달하고 반환값을 그대로 응답한다', async () => {
      usersService.update.mockResolvedValue(result);
      await expect(controller.update(1, dto)).resolves.toEqual(result);
      expect(usersService.update).toHaveBeenCalledWith(1, dto);
    });
  });
});
