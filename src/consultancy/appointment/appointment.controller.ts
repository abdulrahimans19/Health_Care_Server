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

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('add')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  addAppointment(@Body() dto: any) {
    return this.appointmentService.addAppointment(dto);
  }

  @Get('user-appointments')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  getUserAppointment(@Body() userId: string) {
    return this.appointmentService.getUserAppointment(userId);
  }

  @Get('doctor-appointments')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  getDoctorAppointment(@Body() userId: string) {
    return this.appointmentService.getDoctorAppointment(userId);
  }
}
