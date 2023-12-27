import { Module } from '@nestjs/common';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FitnessUser, fitnessUser_schema } from './schema/fitnessUser.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FitnessUser.name, schema: fitnessUser_schema },
    ]),
  ],
  controllers: [FitnessController],
  providers: [FitnessService],
})
export class FitnessModule {}
