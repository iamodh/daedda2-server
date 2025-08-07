import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  readonly nickname: string;

  @IsPhoneNumber('KR')
  readonly phone: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  readonly imageUrl?: string;
}
