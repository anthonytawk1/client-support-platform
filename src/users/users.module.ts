import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './models/users.model';
import { Otp, OtpSchema } from './models/otp.model';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { RefreshToken, RefreshTokenSchema } from './models/refreshToken.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('security.jwtSecret'),
        signOptions: { expiresIn: '1min' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
  exports: [UsersService],
})
export class UsersModule {}
