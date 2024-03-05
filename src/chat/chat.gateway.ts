import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { Namespace } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketAuth } from 'src/types';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Namespace;
  constructor(private readonly chatService: ChatService) {}

  afterInit(): void {
    this.logger.log('webSocketGateway initialized');
  }

  async handleConnection(client: SocketAuth) {
    client.join(client.room);
    const chat = await this.chatService.findRoom(client.room);
    this.server.to(client.id).emit('chatData', chat);
    this.server.to(client.room).emit('userActive', client.id_user);
  }

  handleDisconnect(client: SocketAuth) {
    this.server.to(client.room).emit('userActive', false);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: SocketAuth,
  ) {
    const data = await this.chatService.create(createChatDto, client);
    this.server.to(client.room).emit('newChat', data);
  }

  @SubscribeMessage('sendFile')
  async sendFile(
    @MessageBody() createChatDto: any,
    @ConnectedSocket() client: SocketAuth,
  ) {
    const data = await this.chatService.create(createChatDto, client);
    this.server.to(client.room).emit('newChat', data);
  }

  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(updateChatDto.id, updateChatDto);
  // }

  // @SubscribeMessage('removeChat')
  // remove(@MessageBody() id: string) {
  //   return this.chatService.remove(id);
  // }
}
