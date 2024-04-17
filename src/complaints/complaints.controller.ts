import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Types } from 'mongoose';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  create(@Body() createComplaintDto: CreateComplaintDto, @Req() request: any) {
    const userId: Types.ObjectId = request.user.userId;
    return this.complaintsService.create(createComplaintDto, userId);
  }

  @Get('grouped')
  findUserComplaintsGroupedByStatus(
    @Req() request: any,
    @Query() query: Record<string, string>,
  ) {
    const userId: Types.ObjectId = request.user.userId;
    return this.complaintsService.findAllUserComplaintsGroupedByStatus(
      userId,
      +query.limit,
      +query.page,
    );
  }

  @Roles(['admin'])
  @UseGuards(AuthorizationGuard)
  @Get()
  findAllcomplaints(@Query() query: Record<string, string>) {
    return this.complaintsService.findAll(+query.limit, +query.page);
  }

  @Get(':id')
  getUserComplaintById(
    @Param('id') complaintId: Types.ObjectId,
    @Req() request: any,
  ) {
    const userId: Types.ObjectId = request.user.userId;
    return this.complaintsService.getUserComplaintById(userId, complaintId);
  }

  @Roles(['admin', 'employee'])
  @UseGuards(AuthorizationGuard)
  @Put(':id')
  updateComplaintStatus(
    @Param('id') id: Types.ObjectId,
    @Body() body: any,
  ) {
    const newStatus = body.status
    return this.complaintsService.updateComplaintStatus(id, newStatus);
  }

  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId, @Req() request: any) {
    const userId = request.user.userId;
    return this.complaintsService.remove(id, userId);
  }
}
