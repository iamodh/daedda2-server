import { Injectable, NotFoundException } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InsertResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { CreateJobPostDto } from 'src/job-posts/dto/create-job-post.dto';
import { UpdateJobPostDto } from 'src/job-posts/dto/update-job-post.dto';
import {
  HourlyWage,
  JobPostQueryDto,
  WorkTime,
} from 'src/job-posts/dto/job-post-query.dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
  ) {}

  async findAll(
    jobPostQueryDto: JobPostQueryDto,
  ): Promise<{ data: JobPost[]; nextCursor: string | null }> {
    const { cursor, limit = 5, showPast = false } = jobPostQueryDto;
    const queryBuilder = this.jobPostsRepository
      .createQueryBuilder('job_post')
      .where('1=1')
      .orderBy('job_post.createdAt', 'DESC')
      .limit(limit + 1);

    if (!showPast) {
      queryBuilder.andWhere('job_post.date >= CURRENT_DATE');
    }

    this.applyFitlers(queryBuilder, jobPostQueryDto);

    if (cursor) {
      queryBuilder.andWhere('job_post.createdAt < :cursor', { cursor });
    }

    const jobPosts = await queryBuilder.getMany();

    const hasNextPage = jobPosts.length > limit;
    if (hasNextPage) {
      jobPosts.pop();
    }

    const nextCursor = hasNextPage
      ? jobPosts[jobPosts.length - 1].createdAt.toISOString()
      : null;

    return { data: jobPosts, nextCursor };
  }

  async findOne(id: number): Promise<JobPost | null> {
    const jobPost = await this.jobPostsRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        // JobPost는 전부(기본값) + user는 필요한 것만
        user: { id: true, nickname: true, imageUrl: true },
      },
    });
    if (jobPost === null) {
      throw new NotFoundException(`Post with Id ${id} not found`);
    }

    return jobPost;
  }

  async create(createJobPostDto: CreateJobPostDto): Promise<InsertResult> {
    const result = await this.jobPostsRepository.insert({
      ...createJobPostDto,
    });
    return result;
  }

  async update(
    jobPostId: number,
    updateJobPostDto: UpdateJobPostDto,
  ): Promise<UpdateResult> {
    const result = await this.jobPostsRepository.update(
      { id: jobPostId },
      {
        ...updateJobPostDto,
      },
    );
    return result;
  }

  async delete(jobPostId: number) {
    const result = await this.jobPostsRepository.delete({ id: jobPostId });
    return result;
  }

  // 필터 로직
  private applyFitlers(
    queryBuilder: SelectQueryBuilder<JobPost>,
    { searchKeyword, hourlyWage, workTime }: JobPostQueryDto,
  ) {
    if (searchKeyword) {
      queryBuilder.andWhere(
        '(job_post.title ILIKE :keyword OR job_post.content ILIKE :keyword)',
        {
          keyword: `%${searchKeyword}%`,
        },
      );
    }

    if (workTime) {
      if (workTime === WorkTime.SHORT) {
        queryBuilder.andWhere('job_post.totalHours <= :maxHour', {
          maxHour: 4,
        });
      } else if (workTime === WorkTime.MEDIUM) {
        queryBuilder.andWhere(
          'job_post.totalHours > :minHour AND job_post.totalHours <= :maxHour',
          {
            minHour: 4,
            maxHour: 8,
          },
        );
      } else if (workTime === WorkTime.LONG) {
        queryBuilder.andWhere('job_post.totalHours > :maxHour', {
          maxHour: 8,
        });
      }
    }

    if (hourlyWage) {
      if (hourlyWage === HourlyWage.LOW) {
        queryBuilder.andWhere('job_post.hourlyWage <= :hourlyWage', {
          hourlyWage: 10000,
        });
      } else if (hourlyWage === HourlyWage.HIGH) {
        queryBuilder.andWhere('job_post.hourlyWage > :hourlyWage', {
          hourlyWage: 10000,
        });
      }
    }
  }
}
