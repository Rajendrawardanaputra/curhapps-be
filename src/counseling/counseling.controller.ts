import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CounselingService } from './counseling.service';
import { CreateCounselingDto } from './dto/create-counseling.dto';
import { UpdateCounselingDto } from './dto/update-counseling.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Category } from '@prisma/client';

@Controller('counseling')
export class CounselingController {
  constructor(private readonly counselingService: CounselingService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createCounselingDto: CreateCounselingDto,
    // @Request() req: any,
  ) {
    return this.counselingService.create(createCounselingDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('date') date?: string,
    @Query('category') category?: Category,
    @Query('id_user') id_user?: string,
  ) {
    return this.counselingService.findAll({
      user: req.user,
      limit: +limit,
      page: +page,
      date: date,
      category: category,
      id_user: id_user,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.counselingService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCounselingDto: UpdateCounselingDto,
    @Request() req: any,
  ) {
    return this.counselingService.update(id, updateCounselingDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.counselingService.remove(id);
  }
}
