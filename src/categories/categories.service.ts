import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAndUpdateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './categories.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private CategoryModel: Model<Category>,
  ) {}
  async create(
    CreateAndUpdateCategoryDto: CreateAndUpdateCategoryDto,
    userId: Types.ObjectId,
  ) {
    CreateAndUpdateCategoryDto.createdBy = userId;
    const newCategory = await new this.CategoryModel(
      CreateAndUpdateCategoryDto,
    ).save();
    return newCategory;
  }

  async findAll(limit: number, page: number) {
    const skip = (page - 1) * limit;
    const categories = await this.CategoryModel.find().skip(skip).limit(limit);
    if (categories.length === 0) {
      throw new NotFoundException();
    }
    return categories;
  }

  async findOne(id: Types.ObjectId) {
    const category = await this.CategoryModel.findOne({ _id: id });
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  async update(
    id: Types.ObjectId,
    CreateAndUpdateCategoryDto: CreateAndUpdateCategoryDto,
  ) {
    const result = await this.CategoryModel.findOneAndUpdate(
      { _id: id },
      CreateAndUpdateCategoryDto,
      { new: true },
    );

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  async remove(id: Types.ObjectId) {
    const result = await this.CategoryModel.findOneAndDelete({ _id: id });

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}
