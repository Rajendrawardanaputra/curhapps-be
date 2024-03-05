import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { sendResetPassword } from './dto/send-reset-password.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  sendOTP(email: string, otp: number) {
    try {
      this.mailerService.sendMail({
        to: email,
        from: process.env.SMTP_SENDER,
        subject: 'verifikasi 2 langkah',
        template: 'otp',
        context: {
          context: otp,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async resetPassword(payload: sendResetPassword) {
    try {
      const validEmail = await this.userService.findByEmail(payload.email);
      if (!validEmail) {
        throw new NotFoundException('Email not found');
      }
      const email = validEmail.email;
      const token = await this.jwtService.signAsync(
        { email },
        {
          secret: process.env.APP_SECRET,
          expiresIn: process.env.TOKEN_EXPIRED,
        },
      );
      const url = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
      this.mailerService.sendMail({
        to: validEmail.email,
        from: process.env.SMTP_SENDER,
        subject: 'Reset Password',
        template: 'reset-password',
        context: {
          context: url,
        },
      });
      return {
        message: 'Cek Email Anda Untuk Reset Password',
      };
    } catch (err) {
      throw err;
    }
  }
}
