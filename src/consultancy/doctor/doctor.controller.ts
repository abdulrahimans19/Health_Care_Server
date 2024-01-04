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
import { GetUser, Roles } from 'src/shared/decorators';
import { UserRoles } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';
import { Gender } from './schema/doctor.schema';
import { DoctorDto, RateDto } from './dto';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { JwtPayload } from 'src/auth/strategies';
import { DoctorUpdateDto } from './dto/doctor-update.dto';

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
    @Query('today') today?: boolean,
    @Query('anytime') anytime?: boolean,
    @Query('tomorrow') tomorrow?: boolean,
    @Query('exp_start') exp_start?: number,
    @Query('exp_end') exp_end?: number,
  ) {
    return this.doctorService.getDoctor(
      // experience,
      category_id,
      gender,
      page,
      pageSize,
      today,
      anytime,
      tomorrow,
      exp_start,
      exp_end,
    );
  }

  @Get('get-doctor-search/')
  getDoctorBySearch(
    @Query('search') search: string,
    @Query('categoryId') categoryId: string,
  ) {
    return this.doctorService.getDoctorBySearch(search, categoryId);
  }

  @Post('get-doctor-details/:doctorId')
  getDoctorDetails(@Param('doctorId') doctorId: string, @Body() dto: any) {
    return this.doctorService.getDoctorDetails(doctorId, dto);
  }

  @Get('get-doctor-by-category')
  getDoctorByCategory(
    @Query('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.doctorService.getDoctorByCategory(categoryId, page, pageSize);
  }

  @Post('doctor-add-rating')
  addDoctorRating(
    @GetProfileId() profileId: string,
    @Query('doctor_id') doctor_id: string,
    @Body() rateDto: RateDto,
  ) {
    return this.doctorService.addDoctorRating(rateDto, doctor_id, profileId);
  }

  @Get('top-doctors')
  getTopDoctors() {
    return this.doctorService.getTopDoctors();
  }

  @Post('update-doctor')
  updateDoctor(
    @GetUser() user: JwtPayload,
    @Body() updateData: DoctorUpdateDto,
  ) {
    return this.doctorService.updateDoctor(user, updateData);
  }

  @Post('add-slots/:doctorId')
  addDoctorSlots(@Body() dto: any, @Param('doctorId') doctorId: string) {
    return this.doctorService.addDoctorSlots(doctorId, dto);
  }

  @Get('admin/doctor-search')
  doctorSearch(
    @Query('search') search: string,
    @Query('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.doctorService.doctorSearch(search, categoryId, page, pageSize);
  }

  @Get('admin/top-doctors')
  getTopDoctorsForAdmin(
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedPageSize = pagesize ? parseInt(pagesize, 10) : undefined;
    return this.doctorService.getTopDoctorsForAdmin(parsedPage, parsedPageSize);
  }

  @Get('admin/total-doctors')
  getTotalDoctors(
    @Query('search') search?: string,
    @Query('gender') gender?: Gender,
    @Query('categoryId') categoryId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') pageSize?: number,
  ) {
    return this.doctorService.getTotalDoctors(
      search,
      gender,
      categoryId,
      sortBy,
      sortOrder,
      page,
      pageSize,
    );
  }
}
