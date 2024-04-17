import { IsEmail, IsString } from 'class-validator';

export class otpVerificationDto {
  @IsString()
  verificationToken: string;

  @IsString()
  otp: string;
}
