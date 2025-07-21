import { Body, Controller, Get, Post } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from 'src/job-posts/dto/create-jop-post.dto';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}
  @Get()
  findAll(): Promise<JobPost[]> {
    return this.jobPostsService.findAll();
  }

  @Post()
  create(@Body() createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    return this.jobPostsService.create(createJobPostDto);
  }
}
