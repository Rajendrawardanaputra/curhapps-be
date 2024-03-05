import { ChatType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
export class CreateChatDto {
  @IsEnum({ ChatType: 'Please enter valid type' })
  type: ChatType;

  @IsString()
  message: string;
}
