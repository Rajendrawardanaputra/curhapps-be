import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
// import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Logger } from '@nestjs/common';
import { SocketAuth } from 'src/types';
import { Namespace } from 'socket.io';

@WebSocketGateway({
  namespace: 'notification',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer() server: Namespace;
  constructor(private readonly notificationService: NotificationService) {}

  afterInit(): void {
    this.logger.log('webSocketGateway notif initialized');
  }

  async handleConnection(client: SocketAuth) {
    client.join(client.id_user);
    this.server
      .to(client.id_user)
      .emit(
        'notificationData',
        await this.notificationService.findaAll(client.id_user),
      );
  }

  handleDisconnect(client: SocketAuth) {
    client.join(client.id_user);
  }

  @SubscribeMessage('createNotification')
  async create(@MessageBody() createNotificationDto: CreateNotificationDto) {
    try {
      const data = await this.notificationService.create(createNotificationDto);
      this.server
        .to(createNotificationDto.id_user)
        .emit('newNotification', data);
    } catch (err) {
      throw err;
    }
  }

  @SubscribeMessage('removeAllNotification')
  removeAll(@ConnectedSocket() client: SocketAuth) {
    return this.notificationService.remove(client.id_user);
  }

  @SubscribeMessage('removeNotification')
  remove(@MessageBody() id: string) {
    return this.notificationService.removeOne(id);
  }
}
