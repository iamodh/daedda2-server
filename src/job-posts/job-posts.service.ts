import { Injectable, NotFoundException } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateJobPostDto } from 'src/job-posts/dto/create-job-post.dto';
import { UpdateJobPostDto } from 'src/job-posts/dto/update-job-post.dto';
import { JobPostQueryDto } from 'src/job-posts/dto/job-post-query.dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
  ) {}

  async findAll(
    jobPostQueryDto: JobPostQueryDto,
  ): Promise<{ data: JobPost[]; nextCursor: string | null }> {
    const { cursor, limit = 5, searchKeyword } = jobPostQueryDto;
    const queryBuilder = this.jobPostsRepository
      .createQueryBuilder('job_post')
      .where('1=1')
      .orderBy('job_post.createdAt', 'DESC')
      .limit(limit + 1);

    if (searchKeyword) {
      queryBuilder.andWhere(
        '(job_post.title ILIKE :keyword OR job_post.content ILIKE :keyword)',
        {
          keyword: `%${searchKeyword}%`,
        },
      );
    }
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
    const jobPost = await this.jobPostsRepository.findOneBy({ id });

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
}
