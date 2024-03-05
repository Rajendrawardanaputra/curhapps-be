import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [
    NotificationGateway,
    NotificationService,
    JwtService,
    PrismaService,
    UserService,
  ],
})
export class NotificationModule {}
