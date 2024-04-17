import { Param } from "@nestjs/common";
import { IsString } from "class-validator";


export class changePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    newPassword: string;
    
}