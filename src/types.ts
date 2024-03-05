import { Socket } from 'socket.io';

export type WsUser = {
  id_user: string;
  name: string;
  room: string;
};
export type SocketAuth = Socket & WsUser;
