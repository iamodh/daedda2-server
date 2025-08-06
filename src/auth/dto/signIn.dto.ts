import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  readonly username: string;

  @MinLength(8)
  @MaxLength(20)
  @IsString()
  readonly password: string;
}
