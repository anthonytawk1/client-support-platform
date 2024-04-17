import { IsInt, IsString, IsEmail, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: String;

  @IsString()
  firstlastName: String;

  @IsEmail()
  email: String;

  @IsString()
  password: string;
}
