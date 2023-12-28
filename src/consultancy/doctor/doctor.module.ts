import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, doctor_schema } from './schema/doctor.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: doctor_schema }]),
    UserModule
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports:[DoctorService]
})
export class DoctorModule {}
