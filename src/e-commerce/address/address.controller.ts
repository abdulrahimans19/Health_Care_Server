import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddressService } from './address.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  getAddress(@GetProfileId() profile_id: string) {
    return this.addressService.getAddress(profile_id);
  }

  @Post('/create')
  createAddress(
    @GetProfileId() profile_id: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(profile_id, dto);
  }

  @Post('/update')
  updateAddress(
    @GetProfileId() profile_id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(profile_id, dto);
  }
}
