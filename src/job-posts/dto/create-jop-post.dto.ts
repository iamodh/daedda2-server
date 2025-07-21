import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobPostDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly location: string;

  @Type(() => Number) // string -> number로 타입 변경
  @IsNumber()
  readonly pay: number;

  @Type(() => Date) // string -> Date로 type 변경
  @IsDate()
  readonly date: Date; // ISO 문자열 또는 Date → 백엔드 응답 기준

  @IsString()
  readonly startTime: string; // 'HH:mm' 형식

  @IsString()
  readonly endTime: string; // 'HH:mm' 형식

  @IsNumber()
  readonly totalHours: number;

  @IsString()
  readonly place: string;

  @IsOptional()
  @IsString()
  readonly imageUrl: string | null;
}
