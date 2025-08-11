import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsController } from './job-posts.controller';
import { AuthGuard } from '../auth/auth.guard';
import { JobPostsService } from './job-posts.service';
import { DeleteResult, InsertResult } from 'typeorm';
import { CreateJobPostDto } from '../job-posts/dto/create-job-post.dto';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { NotFoundException } from '@nestjs/common';
import { AuthRequest } from '../auth/auth.service';
import { UpdateJobPostDto } from '../job-posts/dto/update-job-post.dto';

describe('JobPostsController', () => {
  let controller: JobPostsController;

  const mockJobPostsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostsController],
      providers: [
        {
          provide: JobPostsService,
          useValue: mockJobPostsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobPostsController>(JobPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('유효한 dto가 주어지면 dto를 서비스에 그대로 전달하고 반환값을 그대로 응답한다.', async () => {
      const dto = { limit: 5, cursor: null };
      const result = { data: [{ id: 1 }], nextCursor: 'abc' };
      mockJobPostsService.findAll.mockResolvedValue(result);

      await expect(controller.findAll(dto)).resolves.toEqual(result);
      expect(mockJobPostsService.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('create', () => {
    it('요청 dto를 서비스에 전달하고 InsertResult(identifiers 포함)를 그대로 응답한다', async () => {
      const dto = { title: 't' } as CreateJobPostDto;
      const result: Partial<InsertResult> = {
        identifiers: [{ id: 1 }],
      };
      mockJobPostsService.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toEqual(result);
      expect(mockJobPostsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('id를 서비스에 전달하고 해당 JobPost를 그대로 응답한다', async () => {
      const post = { id: 123 } as JobPost;
      mockJobPostsService.findOne.mockResolvedValue(post);

      await expect(controller.findOne(123)).resolves.toEqual(post);
      expect(mockJobPostsService.findOne).toHaveBeenCalledWith(123);
    });

    it('jobPostId와 req.user.sub를 ownerId로 매핑해 서비스에 전달하고 UpdateResult를 그대로 응답한다', async () => {
      mockJobPostsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('jobPostId와 req.user.sub를 ownerId로 매핑해 서비스에 전달하고 DeleteResult를 그대로 응답한다', async () => {
      const dto = { title: 'u' } as UpdateJobPostDto;
      const req = { user: { sub: 42 } } as AuthRequest;
      const result: Partial<DeleteResult> = { affected: 1 };

      mockJobPostsService.update.mockResolvedValue(result);

      await expect(controller.update(7, dto, req)).resolves.toEqual(result);
      expect(mockJobPostsService.update).toHaveBeenCalledWith(7, 42, dto);
    });
  });

  describe('delete', () => {
    it('jobPostId와 ownerId를 delete 서비스에 전달해야 한다.', async () => {
      const req = { user: { sub: 42 } } as AuthRequest;
      const result: Partial<DeleteResult> = { affected: 1 };

      mockJobPostsService.delete.mockResolvedValue(result);

      await expect(controller.delete(7, req)).resolves.toEqual(result);
      expect(mockJobPostsService.delete).toHaveBeenCalledWith(7, 42);
    });
  });
});
