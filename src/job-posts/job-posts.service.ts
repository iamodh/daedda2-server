import { Injectable, NotFoundException } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobPostDto } from 'src/job-posts/dto/create-jop-post.dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
  ) {}

  findAll(): Promise<JobPost[]> {
    return this.jobPostsRepository.find();
  }

  findOne(id: number): Promise<JobPost | null> {
    const jobPost = this.jobPostsRepository.findOneBy({ id });

    if (jobPost === null) {
      throw new NotFoundException(`Post with Id ${id} not found`);
    }

    return jobPost;
  }

  async create(createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    const result = await this.jobPostsRepository.save({
      ...createJobPostDto,
    });
    return result;
  }
}
