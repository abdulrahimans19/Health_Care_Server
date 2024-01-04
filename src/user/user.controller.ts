import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser, Roles } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from './schema/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/update-account-status')
  updateUserActiveStatus(@GetUser() user: JwtPayload) {
    return this.userService.updateUserActiveStatus(user);
  }

  @Get('/get-user-count')
  getUserCount() {
    return this.userService.getUserCount();
  }

  @Get('/user-list')
  async getUsersForAdmin(@Query() dto: any): Promise<any> {
    return this.userService.getUsersForAdmin(dto);
  }

  @Get('/update-user-status')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateUserStatus(@Query('id') id: string) {
    return this.userService.updateUserStatus(id);
  }
}
