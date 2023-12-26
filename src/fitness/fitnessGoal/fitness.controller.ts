import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { FitnessService } from './fitness.service';
import { GoalDto } from './Dto/fitnessGoal.dto';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';

@Controller('fitness')
export class FitnessController {
  constructor(private readonly fitnessService: FitnessService) {}

  @Post('create-user')
  createFitnessUser(@GetProfileId() profile_id: string, @Body() dto: GoalDto) {
    console.log(profile_id);
    return this.fitnessService.createFitnessUser(dto, profile_id);
  }

  @Put('update-user')
  editFitnessUser(@GetProfileId() profile_id: string, @Body() dto: GoalDto) {
    return this.fitnessService.editFitnessUser(dto, profile_id);
  }
  @Delete('delete-user')
  deleteFitnessUser(@GetProfileId() profile_id: string) {
    return this.fitnessService.deleteFitnessUser(profile_id);
  }
  @Get('get-user')
  getFitnessUser(@GetProfileId() profile_id: string) {
    try {
      return this.fitnessService.getFitnessUser(profile_id);
    } catch (error) {
      throw error;
    }
  }
}
