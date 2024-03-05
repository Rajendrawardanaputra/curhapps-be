import { Module } from '@nestjs/common';
import { CounselingService } from './counseling.service';
import { CounselingController } from './counseling.controller';
import { PrismaService } from 'src/prisma.service';
import { RoomService } from 'src/room/room.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [CounselingController],
  providers: [
    CounselingService,
    PrismaService,
    RoomService,
    JwtService,
    UserService,
  ],
})
export class CounselingModule {}
