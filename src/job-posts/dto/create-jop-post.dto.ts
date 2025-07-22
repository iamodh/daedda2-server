import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  //   ValidationArguments,
  //   ValidatorConstraint,
  //   ValidatorConstraintInterface,
} from 'class-validator';

// @ValidatorConstraint({ name: 'isStartBeforeEnd', async: false })
// export class isStartBeforeEnd implements ValidatorConstraintInterface {
//   private reason: 'inavlid-format' | 'not-before' | null = null;

//   validate(_: any, args: ValidationArguments): boolean {
//     const obj = args.object as any; // 전체 DTO
//     const startTime: string = obj.startTime;
//     const endTime: string = obj.endTime;

//     if (!startTime || !endTime) {
//       this.reason = null;
//       return true;
//     } // 다른 validator가 검사

//     const [startHour, startMin] = startTime.split(':').map(Number);
//     const [endHour, endMin] = endTime.split(':').map(Number);

//     // 검사 1. HH:MM 형태인가?
//     if (
//       isNaN(startHour) ||
//       isNaN(startMin) ||
//       isNaN(endHour) ||
//       isNaN(endMin)
//     ) {
//       this.reason = 'inavlid-format';
//       return false;
//     }

//     const startMinutes = startHour * 60 + startMin;
//     const endMinutes = endHour * 60 + startMin;

//     // 검사 2. 시작 시간이 마치는 시간보다 작은가?
//     if (startMinutes >= endMinutes) {
//       this.reason = 'not-before';
//     }

//     this.reason = null;
//     return true;
//   }

//   defaultMessage() {
//     if (this.reason === 'inavlid-format') {
//       return '시간 형식이 잘못되었습니다. (예: 16:30)';
//     } else if (this.reason === 'not-before')
//       return 'startTime은 endTime보다 빠른 시간이어야 합니다.';
//     return '시간이 유효하지 않습니다.'; // fallback
//   }
// }

export class CreateJobPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  readonly title: string;

  @IsString()
  readonly location: string;

  @IsNumber()
  @Type(() => Number) // string -> number로 타입 변경
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
