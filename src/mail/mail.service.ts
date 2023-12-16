import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendEmailOtpForVerification(email: string, otp: string) {
    const noReplyEmail = `no-reply@${process.env.NODEMAILER_USERNAME}`; // Set the no-reply email address
    await this.mailService.sendMail({
      to: email,
      from: noReplyEmail,
      subject: 'Verify Email',
      template: 'register-otp',
      context: { otp },
    });
    return { message: 'Otp has been send to your email address.' };
  }

  async sendEmailOtpForPasswordReset(email: string, otp: string) {
    const noReplyEmail = `no-reply@${process.env.NODEMAILER_USERNAME}`; // Set the no-reply email address
    await this.mailService.sendMail({
      to: email,
      from: noReplyEmail,
      subject: 'Password Reset',
      template: 'password-reset',
      context: { otp },
    });
    return { message: 'Otp has been send to your email address.' };
  }
}
