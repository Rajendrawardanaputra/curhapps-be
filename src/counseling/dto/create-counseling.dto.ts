import { Category, StatusConseling } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class CreateCounselingDto {
  @IsEnum(Category, { message: 'Please select a valid category' })
  category: Category;

  @IsOptional()
  @IsEnum(StatusConseling, { message: 'Please select a valid status' })
  status: StatusConseling;

  @IsNumber()
  @IsOptional()
  @Max(5)
  rating: number;

  @IsString()
  id_student: string;

  @IsString()
  id_teacher: string;

  @IsOptional()
  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  note: string;
}
