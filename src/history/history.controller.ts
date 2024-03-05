import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Category } from '@prisma/client';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('date') date?: string,
    @Query('category') category?: Category,
    @Query('id_user') id_user?: string,
    @Query('name') name?: string,
  ) {
    return this.historyService.findAll({
      user: req.user,
      limit: +limit,
      page: +page,
      date: date,
      category: category,
      id_user: id_user,
      name: name,
    });
  }
}
