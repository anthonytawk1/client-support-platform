import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsMongoId, IsOptional, IsString } from "class-validator";
import mongoose, { Types } from "mongoose";
import { COMPLAINT_STATUS } from "src/enums/complaint-status";


export class CreateComplaintDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    // @IsMongoId()
    // categoryIds: [mongoose.Types.ObjectId];
    @IsArray()
    @Transform(({ value }) => value.map((id: mongoose.Types.ObjectId) => id.toString())) // Transform Types.ObjectId to string
    @IsMongoId({ each: true })
    categoryIds: string[];
  
    @IsOptional()
    @IsEnum(COMPLAINT_STATUS)
    @IsString()
    status: COMPLAINT_STATUS;

    @IsOptional()
    @IsMongoId()
    createdBy: Types.ObjectId;

}
