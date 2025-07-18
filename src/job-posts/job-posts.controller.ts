import { Controller, Get } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { JobPostsService } from './job-posts.service';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}
  @Get()
  findAll(): Promise<JobPost[]> {
    return this.jobPostsService.findAll();
  }
}
