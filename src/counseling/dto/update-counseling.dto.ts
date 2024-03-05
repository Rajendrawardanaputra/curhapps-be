import { PartialType } from '@nestjs/mapped-types';
import { CreateCounselingDto } from './create-counseling.dto';

export class UpdateCounselingDto extends PartialType(CreateCounselingDto) {}
