import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  otpType: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  verificationToken: string;

  @Prop({ required: true })
  attemptsLeft: number;

  @Prop({ required: true })
  expiryDate: Date;
}
export type OtpDocument = mongoose.HydratedDocument<Otp>;
export const OtpSchema = SchemaFactory.createForClass(Otp);
