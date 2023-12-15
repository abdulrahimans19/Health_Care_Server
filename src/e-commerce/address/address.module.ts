import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, address_schema } from './schema/address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: address_schema }]),
  ],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
