import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotService } from './slots.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Slots, slot_schema } from './schema/slots.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slots.name, schema: slot_schema }
    ]),
    UserModule
  ],
  controllers: [SlotsController],
  providers: [SlotService]
})
export class SlotsModule { }
