import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Complaint } from './complaints.model';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private ComplaintModel: Model<Complaint>,
    private eventsGateway: EventsGateway,
  ) {}
  async create(createComplaintDto: CreateComplaintDto, userId: Types.ObjectId) {
    const numberOfDocuments = await this.ComplaintModel.countDocuments();
    createComplaintDto.title += `#${numberOfDocuments}`;

    createComplaintDto.createdBy = userId;
    const newComplaint = await new this.ComplaintModel(
      createComplaintDto,
    ).save();
    return newComplaint;
  }

  async findAllUserComplaintsGroupedByStatus(
    userId: Types.ObjectId,
    limit: number,
    page: number,
  ) {
    const skip = (page - 1) * limit;
    const aggregation: any[] = [
      [
        {
          $match: {
            createdBy: userId,
          },
        },
        {
          $group: {
            _id: '$status',
            complaints: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ],
    ];
    const result = await this.ComplaintModel.aggregate(aggregation);
    if (result.length === 0) {
      throw new NotFoundException();
    }
    return this.ComplaintModel.aggregate(aggregation);
  }

  async getUserComplaintById(
    userId: Types.ObjectId,
    complaintId: Types.ObjectId,
  ) {
    const result = await this.ComplaintModel.findOne({
      createdBy: userId,
      _id: complaintId,
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async findAll(limit: number, page: number) {
    const skip = (page - 1) * limit;
    const aggregation: any[] = [
      [
        {
          $group: {
            _id: '$status',
            complaints: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ],
    ];
    
    const result = await this.ComplaintModel.aggregate(aggregation);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async updateComplaintStatus(id: Types.ObjectId, newStatus: string) {
    const _id = new mongoose.Types.ObjectId(id);
    const result = await this.ComplaintModel.findOne({ _id });
    const userId = result.createdBy;

    const complaintId = id;
    const updatedStatus = { status: newStatus };

    const complaint = await this.ComplaintModel.findOneAndUpdate(
      { _id },
      updatedStatus,
      { new: true },
    );

    if (!complaint) {
      throw new NotFoundException();
    }
    this.eventsGateway.notifyUser(userId, { complaintId, newStatus });
    return complaint;
  }

  async remove(id: Types.ObjectId, userId: Types.ObjectId) {
    const result = await this.ComplaintModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
