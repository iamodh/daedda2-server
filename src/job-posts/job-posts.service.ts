import { Injectable, NotFoundException } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private JobPostsRepository: Repository<JobPost>,
  ) {}

  findAll(): Promise<JobPost[]> {
    return this.JobPostsRepository.find();
  }

  findOne(id: number): Promise<JobPost | null> {
    const jobPost = this.JobPostsRepository.findOneBy({ id });

    if (jobPost === null) {
      throw new NotFoundException(`Post with Id ${id} not found`);
    }

    return jobPost;
  }
}
