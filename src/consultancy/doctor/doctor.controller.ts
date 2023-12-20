import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Roles } from 'src/shared/decorators';
import { UserRoles } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';
import { Gender } from './schema/doctor.schema';
import { DoctorDto } from './dto';
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('add-doctor')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  addDoctor(@Body() dto: DoctorDto) {
    return this.doctorService.addDoctor(dto);
  }

  @Get('get-doctor')
  getDoctor(
    @Query('category_id') category_id?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('gender') gender?: Gender,
    @Query('experience') experience?: number,
  ) {
    return this.doctorService.getDoctor(
      experience,
      category_id,
      gender,
      page,
      pageSize,
    );
  }

  @Get('get-doctor-search')
  getDoctorBySearch(@Query('search') search: string) {
    return this.doctorService.getDoctorBySearch(search);
  }

  @Get('get-doctor-details/:doctorId')
  getDoctorDetails(@Param('doctorId') doctorId: string) {
    return this.doctorService.getDoctorDetails(doctorId);
  }
}
