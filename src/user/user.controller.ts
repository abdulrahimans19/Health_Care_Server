import { Controller, Get } from '@nestjs/common';
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
}
