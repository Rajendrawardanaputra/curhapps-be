import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [StudentController],
  providers: [UserService, PrismaService, JwtService],
})
export class StudentModule {}
