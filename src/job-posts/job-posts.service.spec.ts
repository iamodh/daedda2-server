/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsService } from './job-posts.service';
import { JobPost } from './entities/job-post.entity';
import {
  DeleteResult,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HourlyWage, WorkTime } from './dto/job-post-query.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';

const mockJobPost = {
  id: 1,
  userId: 1,
  title: 'Test Job Post',
  content: 'This is a test.',
  date: new Date('2025-12-25'),
  startTime: '09:00',
  endTime: '18:00',
  totalHours: 8,
  imageUrl: null,
  hourlyWage: 10000,
  createdAt: new Date('2025-08-12T10:00:00.000Z'),
  updatedAt: new Date('2025-08-12T10:00:00.000Z'),
  deletedAt: null,
  user: {
    id: 1,
    nickname: 'tester',
    imageUrl: null,
  },
} as unknown as JobPost;

describe('JobPostsService', () => {
  let service: JobPostsService;

  let mockJobPostsRepo: jest.Mocked<Repository<JobPost>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<JobPost>>;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<JobPost>>;

    mockJobPostsRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<JobPost>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostsService,
        { provide: getRepositoryToken(JobPost), useValue: mockJobPostsRepo },
      ],
    }).compile();

    service = module.get<JobPostsService>(JobPostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('기본 페이지네이션으로 게시글 목록을 반환해야 한다.', async () => {
      const limit = 5;
      const mockPosts = Array<JobPost>(limit)
        .fill(mockJobPost)
        .map((p, i) => ({ ...p, i: i + 1 }));

      mockQueryBuilder.getMany.mockResolvedValue(mockPosts);

      const result = await service.findAll({ limit });

      expect(result.data).toEqual(mockPosts);
      expect(result.nextCursor).toBeNull();
      expect(mockJobPostsRepo.createQueryBuilder).toHaveBeenCalledWith(
        'job_post',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'job_post.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(limit + 1);
      // showPast가 false(기본값)이므로 미래 날짜만 조회
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job_post.date >= CURRENT_DATE',
      );
    });

    it('다음 페이지가 있으면 nextCursor를 반환해야 한다.', async () => {
      const limit = 5;
      const mockPosts = Array<JobPost>(limit + 1)
        .fill(mockJobPost)
        .map((p, i) => ({
          ...p,
          id: i + 1,
          createdAt: new Date(`2025-08-0${i + 1}T10:00:00Z`),
        }));

      mockQueryBuilder.getMany.mockResolvedValue(mockPosts);

      const result = await service.findAll({ limit });
      expect(result.data.length).toBe(limit); // 마지막 데이터 제거
      expect(result.nextCursor).toBe(
        mockPosts[limit - 1].createdAt.toISOString(),
      );
    });

    it('cursor가 있으면 해당 cursor 이전의 데이터를 조회해야 한다.', async () => {
      const limit = 5;
      const mockPosts = Array<JobPost>(limit + 1)
        .fill(mockJobPost)
        .map((p, i) => ({
          ...p,
          id: i + 1,
          createdAt: new Date(`2025-08-0${i + 1}T10:00:00Z`),
        }));
      mockQueryBuilder.getMany.mockResolvedValue(mockPosts);

      const cursor = new Date().toISOString();
      await service.findAll({ limit, cursor });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job_post.createdAt < :cursor',
        { cursor },
      );
    });

    it('showPast가 true이면 지난 날짜의 게시글도 포함해야 한다.', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      await service.findAll({ showPast: true });
      // `job_post.date >= CURRENT_DATE` 조건이 호출되지 않았는지 확인
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        'job_post.date >= CURRENT_DATE',
      );
    });

    it('searchKeyword 필터가 적용되어야 한다.', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const searchKeyword = 'test';
      await service.findAll({ searchKeyword });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(job_post.title ILIKE :keyword OR job_post.content ILIKE :keyword)',
        {
          keyword: `%${searchKeyword}%`,
        },
      );
    });

    it('workTime 필터(SHORT)가 적용되어야 한다', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ workTime: WorkTime.SHORT });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job_post.totalHours <= :maxHour',
        { maxHour: 4 },
      );
    });

    it('hourlyWage 필터(HIGH)가 적용되어야 한다', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ hourlyWage: HourlyWage.HIGH });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job_post.hourlyWage > :hourlyWage',
        { hourlyWage: 10000 },
      );
    });
  });

  describe('findOne', () => {
    it('id에 해당하는 게시글을 반환해야 한다.', async () => {
      mockJobPostsRepo.findOne.mockResolvedValue(mockJobPost);
      const result = await service.findOne(1);

      expect(result).toEqual(mockJobPost);
      expect(mockJobPostsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true },
        select: {
          user: { id: true, nickname: true, imageUrl: true },
        },
      });
    });
    it('게시글을 찾지 못하면 NotFoundException을 던져야 한다.', async () => {
      mockJobPostsRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Post with Id 999 not found'),
      );
    });
  });

  describe('create', () => {
    it('새로운 게시글을 생성하고 결과를 반환해야 한다.', async () => {
      const createDto: CreateJobPostDto = {
        userId: 1,
        title: 'Test',
        content: 'Content',
        date: new Date('2026-01-01'),
        startTime: '10:00',
        endTime: '12:00',
        place: 'Test',
        imageUrl: null,
        location: 'Test',
        pay: 20000,
        totalHours: 2,
        hourlyWage: 10000,
      };

      const insertResult: InsertResult = {
        identifiers: [{ id: 2 }],
        generatedMaps: [],
        raw: {},
      };
      mockJobPostsRepo.insert.mockResolvedValue(insertResult);

      const result = await service.create(createDto);
      expect(result).toEqual(insertResult);
      expect(mockJobPostsRepo.insert).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('게시글을 성공적으로 수정해야 한다.', async () => {
      const jobPostId = 1;
      const ownerId = 1;
      const updateDto: UpdateJobPostDto = { title: 'Updated title' };
      const updateResult = { affected: 1 } as UpdateResult;
      mockJobPostsRepo.update.mockResolvedValue(updateResult);

      const result = await service.update(jobPostId, ownerId, updateDto);
      expect(mockJobPostsRepo.update).toHaveBeenCalledWith(
        {
          id: jobPostId,
          userId: ownerId,
        },
        updateDto,
      );
      expect(result).toBe(updateResult);
    });
    it('업데이트 할 jobPost의 작성자와 ownerId가 일치하지 않으면 ForbiddenException을 던져야 한다.', async () => {
      const jobPostId = 1;
      const ownerId = 2;
      const updateDto: UpdateJobPostDto = { title: 'Updated title' };
      const updateResult = { affected: 0 } as UpdateResult;
      mockJobPostsRepo.update.mockResolvedValue(updateResult);

      await expect(
        service.update(jobPostId, ownerId, updateDto),
      ).rejects.toThrow(
        new ForbiddenException('해당 글의 수정 권한이 없습니다.'),
      );
    });
  });
  describe('delete', () => {
    it('게시글을 성공적으로 삭제해야 한다.', async () => {
      const jobPostId = 1;
      const ownerId = 1;
      const deleteResult = { affected: 1 } as DeleteResult;

      mockJobPostsRepo.delete.mockResolvedValue(deleteResult);
      const result = await service.delete(jobPostId, ownerId);
      expect(result).toBe(deleteResult);
      expect(mockJobPostsRepo.delete).toHaveBeenCalledWith({
        id: jobPostId,
        userId: ownerId,
      });
    });
    it('삭제 할 jobPost의 작성자와 ownerId가 일치하지 않으면 ForbiddenException을 반환한다.', async () => {
      const jobPostId = 1;
      const ownerId = 2;
      const deleteResult = { affected: 0 } as DeleteResult;
      mockJobPostsRepo.delete.mockResolvedValue(deleteResult);

      await expect(service.delete(jobPostId, ownerId)).rejects.toThrow(
        new ForbiddenException('해당 글의 삭제 권한이 없습니다.'),
      );
    });
  });
});
