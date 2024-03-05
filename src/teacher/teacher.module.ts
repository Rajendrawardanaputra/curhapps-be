import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TeacherController],
  providers: [UserService, JwtService, PrismaService],
})
export class TeacherModule {}
