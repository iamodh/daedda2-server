import { PartialType } from '@nestjs/mapped-types';
import { CreateJobPostDto } from 'src/job-posts/dto/create-jop-post.dto';

export class UpdateJobPostDto extends PartialType(CreateJobPostDto) {}
