import { IsString, MinLength } from 'class-validator';

export class resetPassword {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
