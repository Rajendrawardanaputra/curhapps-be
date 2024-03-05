import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { sendResetPassword } from 'src/mail/dto/send-reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { resetPassword } from './dto/reset-password.dto';
import { verifyOtp } from './dto/verify-otp.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { UserService } from 'src/user/user.service';
import { resendOTP } from './dto/resend-top.dto';
import { UpdateProfileDto } from 'src/user/dto/update-profile-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('resend-otp')
  async resendOTP(@Body() payload: resendOTP) {
    return this.authService.resendOTP(payload.token);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    const user = req.user;
    return user;
  }

  @UseGuards(AuthGuard)
  @Put('profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = Date.now() + extname(file.originalname);
          callback(null, filename);
        },
      }),
    }),
  )
  updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image' }),
          new MaxFileSizeValidator({ maxSize: 2000000 }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.updateProfile(req.user, updateUserDto, file);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: verifyOtp) {
    return this.authService.verifyOtp(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: sendResetPassword) {
    return this.mailService.resetPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: resetPassword) {
    return this.authService.resetPassword(dto);
  }
}
