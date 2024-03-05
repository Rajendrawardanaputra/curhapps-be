import { IsBoolean } from 'class-validator';

export class CreateRoomDto {
  // @IsString()
  // name: string;

  @IsBoolean()
  status: boolean;
}
