import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
}

export type CategoryDocument = mongoose.HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
