import { IsString, MaxLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MaxLength(40)
  readonly username: string;

  @IsString()
  readonly password: string;
}
