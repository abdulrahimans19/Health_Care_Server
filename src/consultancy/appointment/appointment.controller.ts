import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto, AppointmentStatus } from './dto';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  @Post('add')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  addAppointment(@Body() dto: AppointmentDto) {
    return this.appointmentService.addAppointment(dto);
  }

  @Get('user-appointments')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  getUserAppointment(
    @GetUser() user: JwtPayload,
    @GetProfileId() profile_id: string,
    @Query('status') status: AppointmentStatus,
  ) {
    return this.appointmentService.getUserAppointment({user_id:user.sub,status,profile_id});
  }

  @Get('doctor-appointments')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  getDoctorAppointment(
    @GetUser() user: JwtPayload,
    ) {
    return this.appointmentService.getDoctorAppointment(user);
  }

  @Post('update-appointment-status')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  updateAppointmentStatus(@Body() dto: string) {
    return this.appointmentService.updateAppointmentStatus(dto);
  }
}
