import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsNotEmpty()
  @IsMongoId()
  address_id: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  street_address: string;

  @IsNotEmpty()
  @IsString()
  zip_code: string;
}
