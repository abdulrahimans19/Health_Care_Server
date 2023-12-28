import {
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  import { Types } from 'mongoose';
  
  export class DoctorUpdateDto {

    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsNotEmpty()
    description: string;
  
    @IsMongoId()
    @IsNotEmpty()
    category_id: Types.ObjectId;
  
    @IsString()
    @IsNotEmpty()
    about: string;
  
    @IsOptional()
    @IsString()
    image: string;
  
    @IsNumber()
    @IsNotEmpty()
    experience: number;

    @IsString()
    @IsNotEmpty()
    gender: string;
  }
  
  export class RateDto {
    @IsNumber()
    @IsNotEmpty()
    rating: number;
  }
  