import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @ValidateIf((o) => o.password !== undefined)
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  oldPassword: string;
}
