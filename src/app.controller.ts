import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { createReadStream } from 'fs';
import { join } from 'path';
// import { MailService } from './mail/mail.service';

@Controller('uploads')
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly mailService: MailService,
  ) {}

  @Get(':file')
  @Header('Content-Type', 'image')
  getStaticFile(@Param('file') path: string): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'uploads/' + path));
    return new StreamableFile(file);
  }

  // @Get('email')
  // tes() {
  //   const postEmail: PostEmail = {
  //     to: 'mkikik@gmail.com',
  //     subject: 'hello',
  //     context: 'otp 12312312',
  //   };
  //   return this.mailService.sendOTP(postEmail);
  // }
}
