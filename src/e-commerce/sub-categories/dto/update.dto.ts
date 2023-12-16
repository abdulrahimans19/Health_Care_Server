import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubCategoryDto {
  @IsNotEmpty()
  @IsMongoId()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsMongoId()
  main_category_id: string;
}
