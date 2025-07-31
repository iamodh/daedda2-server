import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum WorkTime {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export enum HourlyWage {
  LOW = 'low',
  HIGH = 'high',
}

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

  @IsEnum(WorkTime)
  @IsOptional()
  workTime?: WorkTime;

  @IsEnum(HourlyWage)
  @IsOptional()
  hourlyWage?: HourlyWage;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  showPast?: boolean;
}
