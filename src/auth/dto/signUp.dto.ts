import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  readonly username: string;

  @MinLength(8)
  @MaxLength(20)
  @IsString()
  readonly password: string;

  @IsString()
  readonly nickname: string;

  @IsPhoneNumber('KR')
  readonly phone: string;

  @IsEmail()
  readonly email: string;
}
