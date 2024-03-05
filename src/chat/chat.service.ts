import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma.service';
import { SocketAuth } from 'src/types';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  create(createChatDto: CreateChatDto, client: SocketAuth) {
    try {
      if (createChatDto.type === 'message') {
        return this.prisma.chat.create({
          data: {
            ...createChatDto,
            id_user: client.id_user,
            id_room: client.room,
          },
        });
      } else {
        return this.prisma.chat.create({
          data: {
            type: createChatDto.type,
            message: createChatDto.message,
            id_user: client.id_user,
            id_room: client.room,
          },
        });
      }
    } catch (err) {
      throw err;
    }
  }

  async findRoom(id: string) {
    try {
      const data = await this.prisma.room.findUnique({
        where: { id: id },
        include: {
          Chat: {
            orderBy: {
              created_at: 'asc',
            },
          },
        },
      });
      if (!data) {
        throw new NotFoundException('Room not found');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  // update(id: string, updateChatDto: UpdateChatDto) {
  //   return `This action updates a #${id} chat`;
  // }

  // remove(id: string) {
  //   return `This action removes a #${id} chat`;
  // }

  // getRoom(status: boolean) {
  //   return this.prisma.room.findMany({
  //     where: {
  //       status: status,
  //     },
  //   });
  // }
}
