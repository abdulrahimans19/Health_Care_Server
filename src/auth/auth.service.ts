import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import * as schedule from 'node-schedule';
import * as bcrypt from 'bcrypt';
import { SignInDto, SignUpDto } from './dto';
import { MailService } from 'src/mail/mail.service';
import { generateOTP } from 'src/shared/utils/utils';
import { UserService } from 'src/user/user.service';

const OTP_EXPIRATION_TIME = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private resetJob: schedule.Job;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
  ) {}

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.AT_SECRET_KEY },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.RT_SECRET_KEY,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userService.signIn(signInDto);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    return { tokens, user_role: user.roles };
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.userService.signUp(signUpDto);
    const otp = generateOTP();
    await this.userService.updateOtp(user.email, otp);

    this.scheduleOtpReset(user.email);

    return await this.mailService.sendEmailOtpForVerification(user.email, otp);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user || !user.is_active || user.is_deleted) {
      throw new UnauthorizedException(
        'Email does not exist or is not verified',
      );
    }

    const otp = generateOTP();
    await this.userService.updateOtp(email, otp);

    this.scheduleOtpReset(email);

    return await this.mailService.sendEmailOtpForPasswordReset(email, otp);
  }

  async validateOtp(email: string, otp: string, password: string) {
    const user = await this.userService.getUserByEmail(email);
    const isValidOtp = await bcrypt.compare(otp, user.otp);

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.userService.updatePassword(email, password);

    return {
      message:
        "Password reset successfull, You'll be redirected to the login screen now",
    };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.userService.verifyEmailOtp(email, otp);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    return { tokens };
  }

  async resendOtp(email: string) {
    const otp = generateOTP();
    await this.userService.updateOtp(email, otp);

    this.scheduleOtpReset(email);

    return await this.mailService.sendEmailOtpForVerification(email, otp);
  }

  private scheduleOtpReset(email: string): void {
    this.resetJob = schedule.scheduleJob(
      new Date(Date.now() + OTP_EXPIRATION_TIME),
      async () => {
        await this.userService.setOtpNull(email);
      },
    );
  }
}
