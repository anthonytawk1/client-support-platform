import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComplaintsModule } from './complaints/complaints.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import config from './config/config';
import email from './config/email';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [config, email],
    }),
    ComplaintsModule,
    CategoriesModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
