import { IsEmail } from 'class-validator';

export class sendResetPassword {
  @IsEmail()
  email: string;
}
