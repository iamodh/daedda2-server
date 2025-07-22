import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateJobPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  readonly title: string;

  @IsString()
  readonly location: string;

  @IsNumber()
  readonly pay: number;

  @IsDate()
  @Type(() => Date) // string -> Date로 type 변경
  readonly date: Date;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime은 HH:mm 형식이어야 합니다.',
  })
  readonly startTime: string; // 'HH:mm' 형식

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime은 HH:mm 형식이어야 합니다.',
  })
  readonly endTime: string; // 'HH:mm' 형식

  @IsNumber()
  readonly totalHours: number;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  readonly place: string;

  @IsOptional()
  @IsString()
  readonly imageUrl: string | null;
}
