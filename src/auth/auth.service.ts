import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UserService } from './../user/user.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { resetPassword } from './dto/reset-password.dto';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { verifyOtp } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  generateOTP(): number {
    const digits = '0123456789';
    const length = 4;
    let OTP = '';
    for (let i = 1; i <= length; i++) {
      OTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return parseInt(OTP);
  }

  async login(dto: AuthDto) {
    try {
      const user = await this.userService.findByEmail(dto.email);

      if (!user) {
        throw new NotFoundException('Email tidak ditemukan');
      }
      if (await compare(dto.password, user.password)) {
        await this.prisma.otp.deleteMany({
          where: {
            id_user: user.id,
          },
        });

        const otp = this.generateOTP();
        const currentDate = new Date();
        const expiredDate = new Date(currentDate.getTime() + 1 * 60 * 1000);
        await this.prisma.otp.create({
          data: {
            id_user: user.id,
            otp: await hash(otp.toString(), 10),
            created_at: currentDate,
            expired_at: expiredDate,
          },
        });

        // this.mailService.sendOTP(user.email, otp);

        const id_user = user.id;
        const token = await this.jwtService.signAsync(
          { id_user },
          {
            secret: process.env.APP_SECRET,
            expiresIn: '10m',
          },
        );
        return {
          message: 'Cek email untuk login',
          token,
          otp,
        };
      }
      throw new UnauthorizedException('Password salah');
    } catch (err) {
      throw err;
    }
  }

  async verifyOtp(dto: verifyOtp) {
    try {
      const now = new Date();
      const user = await this.jwtService.verifyAsync(dto.token, {
        secret: process.env.APP_SECRET,
      });
      const otpActive = await this.prisma.otp.findFirst({
        where: {
          id_user: user.id_user,
          expired_at: {
            gte: now,
          },
        },
      });

      await this.prisma.otp.deleteMany({
        where: {
          expired_at: {
            lte: now,
          },
        },
      });

      if (!otpActive) {
        throw new NotFoundException('OTP expired');
      }

      if (await compare(dto.otp.toString(), otpActive.otp)) {
        const payload = { id: otpActive.id_user };
        const token = await this.jwtService.signAsync(payload, {
          secret: process.env.APP_SECRET,
          expiresIn: process.env.TOKEN_EXPIRED,
        });

        await this.prisma.otp.deleteMany({
          where: {
            id_user: user.id,
          },
        });

        return { message: 'Login berhasil', token };
      }

      throw new UnauthorizedException('Kode OTP tidak valid');
    } catch (err) {
      throw new UnauthorizedException('Silahkan login kembali');
    }
  }

  async resetPassword(dto: resetPassword) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token, {
        secret: process.env.APP_SECRET,
      });
      const user = await this.userService.findByEmail(payload.email);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: await hash(dto.password, 10),
        },
      });
      return {
        message: 'Password berhasil diperbarui',
      };
    } catch (err) {
      throw new HttpException('Token expired', HttpStatus.FORBIDDEN);
    }
  }

  async resendOTP(token: string) {
    try {
      const now = new Date();
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.APP_SECRET,
      });
      const user = await this.userService.findById(payload.id_user);
      await this.prisma.otp.deleteMany({
        where: {
          expired_at: {
            lte: now,
          },
        },
      });

      const otpActive = await this.prisma.otp.findFirst({
        where: {
          id_user: user.id,
          expired_at: {
            gte: now,
          },
        },
      });

      if (otpActive) {
        throw new ConflictException('Tunggu waktu jeda selama 1 menit');
      } else {
        const otp = this.generateOTP();
        const currentDate = new Date();
        const expiredDate = new Date(currentDate.getTime() + 1 * 60 * 1000);
        await this.prisma.otp.create({
          data: {
            id_user: user.id,
            otp: await hash(otp.toString(), 10),
            created_at: currentDate,
            expired_at: expiredDate,
          },
        });

        throw new HttpException(
          {
            message: 'Cek email untuk login',
            otp,
          },
          HttpStatus.OK,
        );
      }
    } catch (err) {
      throw new HttpException('Token expired', HttpStatus.FORBIDDEN);
    }
  }
}
