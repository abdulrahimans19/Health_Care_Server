import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, address_schema } from './schema/address.schema';
import {
  UserProfile,
  user_profile_schema,
} from 'src/user-profile/schema/user-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Address.name, schema: address_schema },
      { name: UserProfile.name, schema: user_profile_schema },
    ]),
  ],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
