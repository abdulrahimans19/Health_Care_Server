import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMainCategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  image: string;
}
