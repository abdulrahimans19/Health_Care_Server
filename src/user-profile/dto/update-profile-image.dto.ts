import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImageDto {
  @IsNotEmpty()
  @IsMongoId()
  profile_id: string;

  @IsNotEmpty()
  @IsString()
  image: string;
}
 