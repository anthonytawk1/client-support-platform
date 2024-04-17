import { IsEnum, IsMongoId, IsString } from "class-validator";
import { Types } from "mongoose";
import { CATEGORY_NAME } from "src/enums/category-names";

export class CreateAndUpdateCategoryDto {
    @IsEnum(CATEGORY_NAME)
    @IsString()
    name: CATEGORY_NAME;

    @IsString()
    description: string;

    @IsMongoId()
    createdBy: Types.ObjectId;
}
