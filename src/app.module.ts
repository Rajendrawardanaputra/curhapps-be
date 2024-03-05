import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { CounselingModule } from './counseling/counseling.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma.service';
import { NotificationModule } from './notification/notification.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatModule,
    ConfigModule.forRoot(),
    RoomModule,
    CounselingModule,
    MailModule,
    NotificationModule,
    TeacherModule,
    StudentModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, MailService, UserService, PrismaService],
})
export class AppModule {}
