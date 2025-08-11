import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsController } from './job-posts.controller';
import { AuthGuard } from '../auth/auth.guard';
import { JobPostsService } from './job-posts.service';

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
      .useValue({ canActivates: () => true })
      .compile();

    controller = module.get<JobPostsController>(JobPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
