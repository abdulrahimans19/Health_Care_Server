import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Slots } from './schema/slots.schema';
import { SlotsDto } from './dto';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Slots.name) private readonly slotsModel: Model<Slots>,
  ) {}
  async addSlots(dto: SlotsDto) {
    try {
      await this.slotsModel.create(dto);
      return { message: 'Slots created.' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSlot(dto: string) {
    try {
      await this.slotsModel.deleteOne({ _id: dto });
      return { message: 'Slots Deleted.' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getTimeSlots() {
    try {
      const slots = await this.slotsModel.find();

      return slots;
    } catch (error) {
      throw error;
    }
  }
}
