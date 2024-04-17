import { IsEmail, IsString } from 'class-validator';

export class otpDto {
  @IsEmail()
  email: string;

  @IsString()
  verificationToken: string;
}
