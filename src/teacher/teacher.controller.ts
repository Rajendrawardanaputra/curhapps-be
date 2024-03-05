import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { UserService } from 'src/user/user.service';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Roles('student', 'admin')
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('name') name: string,
  ) {
    return this.userService.findAllTeacher({
      page: +page,
      limit: +limit,
      name: name,
    });
  }

  @UseGuards(AuthGuard)
  // @Roles('student', 'admin')
  @Get('availables')
  findAvailable(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('name') name: string,
  ) {
    return this.userService.teacherAvailable({
      page: +page,
      limit: +limit,
      name: name,
    });
  }
}
