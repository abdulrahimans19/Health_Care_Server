import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import { MailModule } from 'src/mail/mail.module';
import { DoctorModule } from 'src/consultancy/doctor/doctor.module';

@Module({
  imports: [UserModule, JwtModule.register({}), MailModule, DoctorModule],
  providers: [AuthService, AtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
