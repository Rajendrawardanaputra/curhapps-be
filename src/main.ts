import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebsocketAdapter } from './websocket.adapter';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma.service';
import { RoomService } from './room/room.service';
// import { NotificationAdapter } from './notification/notification.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useWebSocketAdapter(
    new WebsocketAdapter(
      app,
      configService,
      new UserService(new PrismaService()),
      new RoomService(new PrismaService()),
    ),
  );

  app.enableCors({
    origin: JSON.parse(process.env.ALLOW_ORIGIN),
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.APP_PORT);
}
bootstrap();
