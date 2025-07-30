import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class JobPostQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 5;

  @IsOptional()
  @IsString()
  searchKeyword?: string;
}
