import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateAndUpdateCategoryDto } from './dto/create-category.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Types } from 'mongoose';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Post()
  create(
    @Body() CreateAndUpdateCategoryDto: CreateAndUpdateCategoryDto,
    @Req() request: any,
  ) {
    const userId = request.user.userId;
    return this.categoriesService.create(CreateAndUpdateCategoryDto, userId);
  }

  //!USERS
  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.categoriesService.findAll(+query.limit, +query.page);
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.findOne(id);
  }


  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() CreateAndUpdateCategoryDto: CreateAndUpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, CreateAndUpdateCategoryDto);
  }

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.remove(id);
  }
}
