import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class GoalDto {
  @IsNotEmpty()
  @IsNumber()
  goal_weight: number;

  @IsNotEmpty()
  @IsString()
  goal: string;
}
