import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { UserService } from 'src/user/user.service';

@Controller('student')
export class StudentController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('kelas') kelas: string,
    @Query('name') name: string,
  ) {
    return this.userService.findAllStudents({
      page: +page,
      limit: +limit,
      kelas: kelas,
      name: name,
    });
  }

  @UseGuards(AuthGuard)
  @Roles('teacher')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneStudent(id);
  }
}
