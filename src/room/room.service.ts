import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}
  async create(createRoomDto: CreateRoomDto) {
    try {
      const data = await this.prisma.room.create({
        data: {
          ...createRoomDto,
        },
      });
      return { message: 'room added successfully', data };
    } catch (err) {
      throw err;
    }
  }

  async findAll(options?: { page?: number; limit?: number; status: string }) {
    try {
      const { page = 1, limit = 10, status = null } = options || {};
      const skip = (page - 1) * limit;

      if (Number.isNaN(limit) && Number.isNaN(page)) {
        throw new ForbiddenException('Parameters not included');
      }

      if (status !== null) {
        const rooms = await this.prisma.room.findMany({
          skip,
          take: limit,
          where: {
            status: status === 'true' ? true : false,
          },
        });

        const totalRooms = await this.prisma.room.count({
          where: {
            status: status === 'true' ? true : false,
          },
        });
        const total_pages = Math.ceil(totalRooms / limit);

        if (page > total_pages) {
          throw new NotFoundException('Rooms not found');
        }

        return {
          data: rooms,
          meta_data: {
            total: totalRooms,
            current_page: page,
            limit,
            total_pages,
          },
        };
      }

      const rooms = await this.prisma.room.findMany({
        skip,
        take: limit,
      });

      const totalRooms = await this.prisma.room.count();
      const total_pages = Math.ceil(totalRooms / limit);

      if (page > total_pages) {
        throw new NotFoundException('Rooms not found');
      }

      return {
        data: rooms,
        meta_data: {
          total: totalRooms,
          current_page: page,
          limit,
          total_pages,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: string) {
    try {
      const room = await this.findById(id);
      return room;
    } catch (err) {
      throw err;
    }
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    try {
      await this.findById(id);
      const update = await this.prisma.room.update({
        where: { id },
        data: updateRoomDto,
      });
      if (update) {
        return { message: 'Room updated successfully' };
      }
    } catch (err) {
      throw err;
    }
  }

  async remove(id: string) {
    try {
      await this.findById(id);

      const del = await this.prisma.room.delete({
        where: { id },
      });
      if (del) {
        return { message: 'Room deleted successfully' };
      }
    } catch (err) {
      throw err;
    }
  }

  async findById(id: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id },
        include: {
          Chat: true,
        },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      return { data: room };
    } catch (err) {
      throw err;
    }
  }

  async findByIdActive(id: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id: id, status: true },
      });
      if (!room) {
        throw new NotFoundException('Sorry, the room has been closed');
      }
      return { data: room };
    } catch (err) {
      throw err;
    }
  }
}
