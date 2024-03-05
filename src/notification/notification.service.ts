import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createNotificationDto: CreateNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: createNotificationDto,
      });
    } catch (err) {
      throw err;
    }
  }

  async findaAll(id: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { id_user: id },
    });

    return notifications;
  }

  async remove(id: string) {
    return this.prisma.notification.deleteMany({
      where: { id_user: id },
    });
  }

  async removeOne(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
