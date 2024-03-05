import { IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  id_user: string;

  @IsString()
  title: string;

  @IsString()
  url: string;

  @IsString()
  icon: string;

  @IsString()
  notification: string;
}
