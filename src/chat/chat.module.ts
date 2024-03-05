import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    JwtService,
    PrismaService,
    UserService,
    RoomService,
  ],
})
export class ChatModule {}
