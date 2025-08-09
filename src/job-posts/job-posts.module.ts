import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost } from './entities/job-post.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost]), AuthModule],
  providers: [JobPostsService],
  controllers: [JobPostsController],
})
export class JobPostsModule {}
