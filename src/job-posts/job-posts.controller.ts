import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { JobPost } from './entities/job-post.entity';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from 'src/job-posts/dto/create-job-post.dto';
import { UpdateJobPostDto } from 'src/job-posts/dto/update-job-post.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { JobPostQueryDto } from 'src/job-posts/dto/job-post-query.dto';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}
  @Get()
  findAll(
    @Query() jobPostQueryDto: JobPostQueryDto,
  ): Promise<{ data: JobPost[]; nextCursor: string | null }> {
    return this.jobPostsService.findAll(jobPostQueryDto);
  }

  @Post()
  create(@Body() createJobPostDto: CreateJobPostDto): Promise<InsertResult> {
    return this.jobPostsService.create(createJobPostDto);
  }

  @Get(':jobPostId')
  findOne(@Param('jobPostId') jobPostId: number): Promise<JobPost | undefined> {
    return this.jobPostsService.findOne(jobPostId);
  }

  @Patch(':jobPostId')
  update(
    @Param('jobPostId') jobPostId: number,
    @Body() updateJobPostDto: UpdateJobPostDto,
  ): Promise<UpdateResult> {
    return this.jobPostsService.update(jobPostId, updateJobPostDto);
  }

  @Delete(':jobPostId')
  delete(@Param('jobPostId') jobPostId: number): Promise<DeleteResult> {
    return this.jobPostsService.delete(jobPostId);
  }
}
