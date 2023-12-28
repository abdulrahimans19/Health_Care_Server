import {
  Body,
  Controller,
  Delete,
  Get,
  Global,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SlotService } from './slots.service';
import { SlotsDto } from './dto';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotService: SlotService) {}

  // @Global()

  @Get('time-slots')
  getTimeSlots() {
    return this.slotService.getTimeSlots();
  }

  @Post('/')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  addSlots(@Body() dto: SlotsDto) {
    return this.slotService.addSlots(dto);
  }

  @Delete('/:id')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(RoleGuard)
  deleteSlot(@Param('id') slotId: string) {
    return this.slotService.deleteSlot(slotId);
  }
}
