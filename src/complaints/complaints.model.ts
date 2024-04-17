import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { COMPLAINT_STATUS } from 'src/enums/complaint-status';

@Schema({ timestamps: true })
export class Complaint { 
@Prop({required: true})
title: string;

@Prop({required: true})
description: string;

@Prop({required: true, type: mongoose.Schema.ObjectId, ref: 'categories'})
categoryIds: [Types.ObjectId];

@Prop({required: true, default: COMPLAINT_STATUS.DEFAULT})
status:string;

@Prop({required: true})
createdBy: Types.ObjectId;
}

export type ComplaintDocument = mongoose.HydratedDocument<Complaint>;
export const ComplaintSchema = SchemaFactory.createForClass(Complaint);