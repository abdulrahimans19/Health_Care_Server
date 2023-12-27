import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser, Public } from 'src/shared/decorators';
import {
  ChangePasswordDto,
  PasswordResetDto,
  SignInDto,
  SignUpDto,
  ValidateOtpDto,
  VerifyEmailDto,
} from './dto';
import { JwtPayload } from './strategies';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  forgotPassword(@Body() dto: PasswordResetDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/validate-otp')
  validateOtp(@Body() dto: ValidateOtpDto) {
    const { email, otp, password } = dto;
    return this.authService.validateOtp(email, otp, password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    const { email, otp } = dto;
    return this.authService.verifyEmail(email, otp);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/change-password')
  changePassword(@GetUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }
}
