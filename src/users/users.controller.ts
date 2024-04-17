import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Types } from 'mongoose';
import { loginDto } from './dto/login.dto';
import { SkipAuth } from 'src/decorators/public.routes.decorator';
import { changePasswordDto } from './dto/change-password.dto';
import { otpDto } from './dto/otp.dto';
import { otpVerificationDto } from './dto/verify-otp.dto';
import { APP_USERS_ROLES } from 'src/enums/app-users-roles';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


 @SkipAuth()
 @Put('refresh-token')
refreshToken(@Body()body: any){
  return this.usersService.refreshToken(body);
}
  @SkipAuth()
  @Post()
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @SkipAuth()
  @Post('login')
  login(@Body() loginDto: loginDto) {
    return this.usersService.login(loginDto);
  }

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Get()
  getAllUsers(@Query() query: Record<string, string>) {
    return this.usersService.getAllUsers(+query.page, +query.limit);
  }

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Get(':id')
  getUserById(@Param('id') id: Types.ObjectId) {
    return this.usersService.getUserById(id);
  }

  @SkipAuth()
  @Put('forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.usersService.initiateForgotPassword(email);
  }

  @SkipAuth()
  @Put('resend-password-otp')
  resendPasswordOtp(@Body() otpDto: otpDto) {
    return this.usersService.resendForgetPasswordOTP(otpDto);
  }

  @SkipAuth()
  @Put('verify-forgot-password')
  verifyForgetPassword(@Body() otpVerificationDto: otpVerificationDto) {
    console.log('inside');

    return this.usersService.verifyForgotPasswordOTP(otpVerificationDto);
  }

  @Put('reset-password')
  resetPassword(@Req() request: any, @Body('newPassword') newPassword: string) {
    const userId = request.user.userId;
    return this.usersService.resetPassword(newPassword, userId);
  }

  @Roles(['admin'])
  @UseGuards(AuthorizationGuard)
  @Put('change-user-role/:id')
  changeUserRole(@Param('id') userId: Types.ObjectId, @Body() body: any) {
    const role = body.role;
    return this.usersService.changeUserRole(userId, role);
  }

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Put('activate-deactivate/:id')
  changeActiveStatus(@Param('id') userId: Types.ObjectId, @Body() body: any) {
    const isActive: boolean = body.isActive;
    return this.usersService.changeActiveStatus(userId, isActive);
  }

  @Put(':id')
  changePassword(
    @Param('id') userId: string,
    @Body() changePasswordDto: changePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}
