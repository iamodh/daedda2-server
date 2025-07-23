import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get(':jobPostId')
  findOne(@Param('jobPostId') jobPostId: number): Promise<JobPost | null> {
    return this.jobPostsService.findOne(jobPostId);
  }

  @Post()
  create(@Body() createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    return this.jobPostsService.create(createJobPostDto);
  }
}
