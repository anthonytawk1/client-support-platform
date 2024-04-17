import { IsEnum, IsString } from "class-validator";
import { APP_USERS_ROLES } from "src/enums/app-users-roles";


export class changePasswordDto {
    @IsEnum(APP_USERS_ROLES)
    @IsString()
    role: APP_USERS_ROLES;
}