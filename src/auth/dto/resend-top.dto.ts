import { IsNotEmpty } from 'class-validator';

export class resendOTP {
  @IsNotEmpty()
  token: string;
}
