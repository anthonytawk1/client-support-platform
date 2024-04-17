import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User } from './models/users.model';
import { Otp } from './models/otp.model';
import { CreateUserDto } from './dto/create-user.dto';
import { changePasswordDto } from './dto/change-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { loginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { generateToken } from '../utils/generate-token';
import { generateOTP } from 'src/utils/generate-otp';
import { OTP_TYPE } from 'src/enums/otp-types';
import { otpVerificationDto } from './dto/verify-otp.dto';
import { resetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { otpDto } from './dto/otp.dto';
import { sendEmail } from 'src/utils/send-email';
import emailConfig from '../config/email';
import { RefreshToken } from './models/refreshToken.model';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(RefreshToken.name) private RefreshTokenModel: Model<RefreshToken>,
    private JwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateRandomToken(length: number) {
    return crypto.randomBytes(length).toString('hex');
  }
  private async generateTokenAndRefreshToken(userId: string) {
    
    const accessToken = this.JwtService.sign(
      {userId}
    );

    const refreshToken = await this.generateRandomToken(64)
    const refreshTokenExpiryDate = new Date(new Date().getTime() + (5 * 60 * 60 * 1000)).toISOString();
    const refreshTokenToSave = {
      userId: userId,
      refreshToken: refreshToken,
      expiryDate: refreshTokenExpiryDate,
    }
    await new this.RefreshTokenModel(refreshTokenToSave).save();
    return {
      accessToken,
      refreshToken,
 };
}

async refreshToken({ refreshToken }) {
  const oldToken = await this.RefreshTokenModel.findOneAndDelete({
    refreshToken,
  });
  if (oldToken && oldToken?.expiryDate > new Date()) {
    return this.generateTokenAndRefreshToken(oldToken.userId);
  }
  throw new UnauthorizedException();
}


  async create(createUserDto: CreateUserDto) {
    const userToSave = new this.UserModel(createUserDto);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    userToSave.password = hashedPassword;
    return await userToSave.save();
  }

  async signup(createUserDto: CreateUserDto) {
    const userFound = await this.UserModel.findOne({
      email: createUserDto.email,
    });
    if (userFound) {
      throw new ConflictException();
    } else {
      await this.create(createUserDto);
    }
  }

  async lockUser(userId: Types.ObjectId) {
    return this.UserModel.updateOne(
      { _id: userId },
      { $set: { isLocked: true } },
    );
  }

  async login(loginDto: loginDto) {
    const { email, password } = loginDto;
    const userFound = await this.UserModel.findOne({ email });

    if (!userFound) {
      throw new UnauthorizedException();
    }
    const isEqual = await bcrypt.compare(password, userFound.password);
    const passwordAttemptsLeft = userFound.passwordAttemptsLeft;
    if (!isEqual && passwordAttemptsLeft !== 0) {
      userFound.passwordAttemptsLeft -= 1;
      await userFound.save();
      throw new UnauthorizedException();
    }

    if (userFound.isLocked) {
      throw new UnauthorizedException();
    }

    if (userFound.passwordAttemptsLeft === 0) {
      const userId = userFound._id;
      await this.lockUser(userId);
      throw new UnauthorizedException();
    }
    
    const token = await this.generateTokenAndRefreshToken(userFound._id.toString())
    return {
      token,
      userId: userFound._id.toString(),
    };
  }

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const users = await this.UserModel.find().skip(skip).limit(limit);
    if (!users) {
      throw new NotFoundException();
    }
    return users;
  }

  async getUserById(_id: Types.ObjectId) {

    const user = await this.UserModel.findById(_id);
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async changePassword(userId: string, changePasswordDto: changePasswordDto) {
    const user = await this.UserModel.findById(userId);
    const oldPassword = changePasswordDto.oldPassword;
    const newPassword = changePasswordDto.newPassword;

    if (user) {
      const isEqual = await bcrypt.compare(oldPassword, user.password);
      if (!isEqual) {
        throw new UnauthorizedException();
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      user.forgetPasswordOtpAttemptsLeft = 10;
      user.passwordAttemptsLeft = 10;
      const result = await user.save();
      return result;
    }
  }

  async initiateForgotPassword(email: string) {
    const userFound = await this.UserModel.findOne({ email });
    if (!userFound) {
      throw new ForbiddenException();
    }

    if (userFound.forgetPasswordOtpAttemptsLeft === 0) {
      await this.lockUser(userFound._id);
      throw new ForbiddenException();
    }
    const verificationToken = generateToken(10);
    const otp = generateOTP();

    await this.OtpModel.findOneAndUpdate(
      { userId: userFound._id, otpType: OTP_TYPE.FORGOT_PASSWORD },
      {
        userId: userFound._id,
        verificationToken,
        otpType: OTP_TYPE.FORGOT_PASSWORD,
        otp,
        attemptsLeft: 10,
        expiryDate: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );
    const emailConfig = {
      host: this.configService.get('host'),
      port: this.configService.get('emailPort'),
      secure: false,
      auth: {
        user: this.configService.get('auth.user'),
        pass: this.configService.get('auth.pass'),
      },
    };

    sendEmail(
      {
        to: email,
        subject: this.configService.get('emails.forgotPassword.subject'),
        text: this.configService
          .get('emails.forgotPassword.body')
          .replace('{otp}', otp),
      },
      emailConfig,
    );

    userFound.forgetPasswordOtpAttemptsLeft -= 1;
    await userFound.save();

    return { verificationToken };
  }

  async resendForgetPasswordOTP(otpDto: otpDto) {
    const email = otpDto.email;
    const verificationToken = otpDto.verificationToken;
    const userFound = await this.UserModel.findOne({ email });
    if (!userFound) {

      throw new ForbiddenException();
    }
    if (userFound.isLocked) {

      throw new ForbiddenException();
    }

    if (userFound.forgetPasswordOtpAttemptsLeft === 0) {

      await this.lockUser(userFound._id);
      throw new ForbiddenException();
    }

    const otpRecord = await this.OtpModel.findOneAndDelete({
      verificationToken,
      userId: userFound._id,
      otpType: OTP_TYPE.FORGOT_PASSWORD,
    });
    if (!otpRecord) {

      throw new ForbiddenException();
    }

    const newVerificationToken = generateToken(10);
    const otp = generateOTP();
    await this.OtpModel.findOneAndUpdate(
      { userId: userFound._id, otpType: OTP_TYPE.FORGOT_PASSWORD },
      {
        userId: userFound._id,
        verificationToken: newVerificationToken,
        otpType: OTP_TYPE.FORGOT_PASSWORD,
        otp,
        attemptsLeft: 10,
        expiryDate: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );
    const emailConfig = {
      host: this.configService.get('host'),
      port: this.configService.get('emailPort'),
      secure: false,
      auth: {
        user: this.configService.get('auth.user'),
        pass: this.configService.get('auth.pass'),
      },
    };

    sendEmail(
      {
        to: email,
        subject: this.configService.get('emails.forgotPassword.subject'),
        text: this.configService
          .get('emails.forgotPassword.body')
          .replace('{otp}', otp),
      },
      emailConfig,
    );
    userFound.forgetPasswordOtpAttemptsLeft -= 1;
    await userFound.save();

    return { newVerificationToken };
  }

  async verifyForgotPasswordOTP(otpVerificationDto: otpVerificationDto) {

    const verificationToken = otpVerificationDto.verificationToken;
    const otp = otpVerificationDto.otp;

    const otpRecord = await this.OtpModel.findOne({
      verificationToken,
      otpType: OTP_TYPE.FORGOT_PASSWORD,
      expiryDate: { $gte: new Date() },
      attemptsLeft: { $gt: 0 },
    });

    if (!otpRecord) {

      throw new ForbiddenException();
    }
    if (otpRecord.otp === otp) {
      await this.OtpModel.deleteOne({ _id: otpRecord._id });

      await this.UserModel.findOneAndUpdate(
        { _id: otpRecord.userId },
        {
          $set: {
            forgetPasswordOtpAttemptsLeft: 10,
            passwordAttemptsLeft: 10,
          },
        },
      );
      const userFound = await this.UserModel.findById(otpRecord.userId);
      if (!userFound) {

        throw new ForbiddenException();
      }

      const token = this.JwtService.sign({
        email: userFound.email,
        userId: userFound._id.toString(),
      });
      return {
        token,
      };
    }
  }

  async resetPassword(newPassword: string, userId: string) {
    const userFound = await this.UserModel.findById(userId);
    if (!userFound) {
      throw new ForbiddenException();
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userFound.password = hashedPassword;
    userFound.forgetPasswordOtpAttemptsLeft = 10;
    userFound.passwordAttemptsLeft = 10;
    await userFound.save();
  }

  async retreiveUserRole(userId: string) {

    const userFound = await this.UserModel.findOne({ _id: userId });
    if (!userFound) {

      throw new NotFoundException();
    }
    return userFound.role;
  }

  async changeUserRole(userId: Types.ObjectId, role: string) {
    const result = await this.UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role,
        },
      },
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async changeActiveStatus(userId: Types.ObjectId, isActive: boolean) {
    const result = await this.UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isActive,
        },
      },
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
