import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: String;

  @Prop({ required: true })
  lastName: String;

  @Prop({ required: true })
  email: String;

  @Prop({ required: true })
  password: string;

  @Prop()
  role: string;

  @Prop({ default: true, required: true })
  isActive: Boolean;

  @Prop({ default: 10, required: true })
  forgetPasswordOtpAttemptsLeft: number;

  @Prop({ default: 10, required: true })
  passwordAttemptsLeft: number;

  @Prop({ default: false, required: true })
  isLocked: boolean;
}

export type UserDocument = mongoose.HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
