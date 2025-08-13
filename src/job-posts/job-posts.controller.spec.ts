import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsController } from './job-posts.controller';
import { AuthGuard } from '../auth/auth.guard';
import { JobPostsService } from './job-posts.service';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateJobPostDto } from '../job-posts/dto/create-job-post.dto';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { NotFoundException } from '@nestjs/common';
import { AuthRequest } from '../auth/auth.service';
import { UpdateJobPostDto } from '../job-posts/dto/update-job-post.dto';

describe('JobPostsController', () => {
  let controller: JobPostsController;
  let jobPostsService: jest.Mocked<
    Pick<
      JobPostsService,
      'create' | 'delete' | 'findAll' | 'findOne' | 'update'
    >
  >;

  beforeEach(async () => {
    jest.clearAllMocks();

    jobPostsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostsController],
      providers: [
        {
          provide: JobPostsService,
          useValue: jobPostsService,
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
    it('dto를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      const dto = { limit: 5, cursor: null };
      const result = { data: [{ id: 1 } as JobPost], nextCursor: 'abc' };

      jobPostsService.findAll.mockResolvedValue(result);
      await expect(controller.findAll(dto)).resolves.toEqual(result);
      expect(jobPostsService.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('create', () => {
    it('dto를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      const dto = { title: 't' } as CreateJobPostDto;
      const result = {
        identifiers: [{ id: 1 }],
      } as unknown as InsertResult;
      jobPostsService.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toEqual(result);
      expect(jobPostsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('id를 서비스에 전달하고 해당 JobPost를 그대로 응답한다', async () => {
      const post = { id: 123 } as JobPost;
      jobPostsService.findOne.mockResolvedValue(post);

      await expect(controller.findOne(123)).resolves.toEqual(post);
      expect(jobPostsService.findOne).toHaveBeenCalledWith(123);
    });

    it('서비스에서 반환한 에러를 그대로 응답한다', async () => {
      jobPostsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('jobPostId, req user id와 함께 dto를 서비스에 전달하고 반환값을 그대로 응답한다', async () => {
      const dto = { title: 'u' } as UpdateJobPostDto;
      const req = { user: { sub: 42 } } as AuthRequest;
      const result = { affected: 1 } as UpdateResult;

      jobPostsService.update.mockResolvedValue(result);

      await expect(controller.update(7, dto, req)).resolves.toEqual(result);
      expect(jobPostsService.update).toHaveBeenCalledWith(7, 42, dto);
    });
  });

  describe('delete', () => {
    it('jobPostId, req user id를 서비스에 전달하고 반환값을 그대로 응답한다.', async () => {
      const req = { user: { sub: 42 } } as AuthRequest;
      const result = { affected: 1 } as DeleteResult;

      jobPostsService.delete.mockResolvedValue(result);

      await expect(controller.delete(7, req)).resolves.toEqual(result);
      expect(jobPostsService.delete).toHaveBeenCalledWith(7, 42);
    });
  });
});
