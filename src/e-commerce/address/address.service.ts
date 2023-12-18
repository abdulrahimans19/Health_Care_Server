import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from './schema/address.schema';
import { Model, Types } from 'mongoose';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
  ) {}

  async createAddress(profile_id: string, dto: CreateAddressDto) {
    await this.addressModel.create({
      profile_id: new Types.ObjectId(profile_id),
      ...dto,
    });

    return { message: 'Address added.' };
  }

  async updateAddress(profile_id: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({ _id: dto.address_id });

    if (address?.profile_id.toString() !== profile_id) {
      throw new ConflictException('This address does not belong to you.');
    }

    await this.addressModel.updateOne(
      { _id: dto.address_id },
      {
        $set: {
          ...dto,
        },
      },
    );
    return { message: 'Adderss updated.' };
  }

  async getAddress(profile_id: string) {
    const address = await this.addressModel.find({ profile_id });
    return { address };
  }

  async getSingleAddress(id: string) {
    return await this.addressModel.findOne({ _id: id });
  }
}
