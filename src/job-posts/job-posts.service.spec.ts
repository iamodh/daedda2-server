import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsService } from './job-posts.service';
import { AuthGuard } from '../auth/auth.guard';
import { JobPost } from './entities/job-post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('JobPostsService', () => {
  let service: JobPostsService;

  const qb: Partial<SelectQueryBuilder<JobPost>> = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockJobPostsRepo: Partial<
    Record<keyof Repository<JobPost>, jest.Mock>
  > = {
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostsService,
        { provide: getRepositoryToken(JobPost), useValue: mockJobPostsRepo },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: () => true })
      .compile();

    service = module.get<JobPostsService>(JobPostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be 4', () => {
    expect(2 + 2).toEqual(4);
  });
});
