import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from 'src/job-posts/dto/create-jop-post.dto';
import { UpdateJobPostDto } from 'src/job-posts/dto/update-jop-post.dto';

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

  @Patch(':jobPostId')
  update(
    @Param('jobPostId') jobPostId: number,
    @Body() updateJobPostDto: UpdateJobPostDto,
  ): Promise<string> {
    return this.jobPostsService.update(jobPostId, updateJobPostDto);
  }

  @Post()
  create(@Body() createJobPostDto: CreateJobPostDto): Promise<string> {
    return this.jobPostsService.create(createJobPostDto);
  }
}
