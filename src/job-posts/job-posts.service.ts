import { Injectable, NotFoundException } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateJobPostDto } from 'src/job-posts/dto/create-job-post.dto';
import { UpdateJobPostDto } from 'src/job-posts/dto/update-job-post.dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
  ) {}

  async findAll(): Promise<JobPost[]> {
    const found = await this.jobPostsRepository.find();
    return found;
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
