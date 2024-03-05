import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { SocketAuth } from 'src/types';
import { UserService } from 'src/user/user.service';

export class WebsocketAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
    private userService: UserService,
    private roomService: RoomService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: JSON.parse(process.env.ALLOW_ORIGIN),
    };
    const optionsWithCors: ServerOptions = {
      ...options,
      cors,
    };

    const server: Server = super.createIOServer(port, optionsWithCors);
    const jwtService = this.app.get(JwtService);
    server
      .of('chat')
      .use(ChatPool(jwtService, this.userService, this.roomService));
    server
      .of('notification')
      .use(NotificationPool(jwtService, this.userService));
    return server;
  }
}

const ChatPool =
  (
    jwtService: JwtService,
    userService: UserService,
    roomService: RoomService,
  ) =>
  async (socket: SocketAuth, next: any) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers['authorization'];
      const roomId = socket.handshake.query.room;
      console.log(roomId);
      console.log(token);
      const validRoom = await roomService.findByIdActive(roomId as string);
      const payload = jwtService.verify(token, {
        secret: process.env.APP_SECRET,
      });
      const user = await userService.findById(payload.id);
      socket.id_user = user.id;
      socket.name = user.name;
      socket.room = validRoom.data.id;
      next();
    } catch (err) {
      next(new Error(err.message));
    }
  };

const NotificationPool =
  (jwtService: JwtService, userService: UserService) =>
  async (socket: SocketAuth, next: any) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers['authorization'];
      const payload = jwtService.verify(token, {
        secret: process.env.APP_SECRET,
      });
      const user = await userService.findById(payload.id);
      socket.id_user = user.id;
      socket.name = user.name;
      next();
    } catch (err) {
      next(new Error(err.message));
    }
  };
