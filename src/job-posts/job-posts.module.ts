import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost } from './entities/job-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost])],
  providers: [JobPostsService],
  controllers: [JobPostsController],
})
export class JobPostsModule {}
