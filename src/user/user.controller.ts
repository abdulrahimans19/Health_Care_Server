import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';

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
}
