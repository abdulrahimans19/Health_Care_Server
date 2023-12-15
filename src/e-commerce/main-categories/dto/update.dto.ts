import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMainCategoryDto {
  @IsNotEmpty()
  @IsMongoId()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  image: string;
}
