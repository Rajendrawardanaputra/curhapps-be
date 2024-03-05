import { IsNotEmpty, IsNumber } from 'class-validator';

export class verifyOtp {
  @IsNotEmpty()
  token: string;

  @IsNumber()
  @IsNotEmpty()
  otp: number;
}
