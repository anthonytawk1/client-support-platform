import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { Complaint, ComplaintSchema } from './complaints.model';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from 'src/events/events.module';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
    ]),
    EventsModule,
    UsersModule
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: []
})
export class ComplaintsModule {}
