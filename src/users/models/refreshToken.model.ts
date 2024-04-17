import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class RefreshToken extends Document {
  @Prop({ required: true })
  refreshToken: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  expiryDate: Date;
  @Prop()
  email: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ refreshToken:1});