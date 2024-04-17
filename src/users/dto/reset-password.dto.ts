import { IsEmail, IsString } from 'class-validator';

export class resetPasswordDto {
    @IsString()
    verificationToken: string;

    @IsString()
    newPassword: string;
}