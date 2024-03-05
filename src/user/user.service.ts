/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { hash, compare } from 'bcryptjs';
import { unlinkSync } from 'fs';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile-dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateUserDto) {
    try {
      const userExist = await this.findByEmail(dto.email);
      if (userExist) {
        throw new ConflictException('Email sudah digunakan');
      }
      await this.prisma.user.create({
        data: {
          ...dto,
          password: await hash(dto.password, 10),
        },
      });

      throw new HttpException('User berhasil ditambah', HttpStatus.CREATED);
    } catch (err) {
      throw err;
    }
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: Role;
    name?: string;
  }) {
    try {
      const { page = 0, limit = 0, role = null, name = null } = options || {};
      const skip = (page - 1) * limit;
      if (role !== null) {
        if (role === 'admin') {
          throw new NotFoundException('User not found');
        }
        if (name !== null) {
          const users = await this.prisma.user.findMany({
            skip,
            take: limit,
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              address: true,
              class: true,
              photo: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
            where: {
              name: {
                contains: name,
              },
              role: role,
            },
          });

          const totalUsers = await this.prisma.user.count({
            where: {
              name: {
                contains: name,
              },
              role: role,
            },
          });
          const total_pages = Math.ceil(totalUsers / limit);

          if (page > total_pages) {
            throw new NotFoundException('Users not found');
          }

          return {
            data: users,
            name,
            meta_data: {
              total: totalUsers,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        const users = await this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            class: true,
            photo: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
          where: {
            role: role,
          },
        });

        const totalUsers = await this.prisma.user.count({
          where: {
            role: role,
          },
        });
        const total_pages = Math.ceil(totalUsers / limit);

        if (page > total_pages) {
          throw new NotFoundException('Users not found');
        }

        return {
          data: users,
          meta_data: {
            total: totalUsers,
            current_page: page,
            limit,
            total_pages,
            prev: page > 1 ? page - 1 : null,
            next: page < total_pages ? page + 1 : null,
          },
        };
      }

      if (name !== null) {
        const users = await this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            class: true,
            photo: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
          where: {
            name: {
              contains: name,
            },
            role: {
              not: 'admin',
            },
          },
        });

        const totalUsers = await this.prisma.user.count({
          where: {
            name: {
              contains: name,
            },
            role: {
              not: 'admin',
            },
          },
        });
        const total_pages = Math.ceil(totalUsers / limit);

        if (page > total_pages) {
          throw new NotFoundException('Users not found');
        }

        return {
          data: users,
          meta_data: {
            total: totalUsers,
            current_page: page,
            limit,
            total_pages,
            prev: page > 1 ? page - 1 : null,
            next: page < total_pages ? page + 1 : null,
          },
        };
      }

      if (Number.isNaN(limit) && Number.isNaN(page)) {
        throw new ForbiddenException('Parameters not included');
      }

      const users = await this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          class: true,
          photo: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
        where: {
          role: {
            not: 'admin',
          },
        },
      });

      const totalUsers = await this.prisma.user.count({
        where: {
          role: {
            not: 'admin',
          },
        },
      });

      const total_pages = Math.ceil(totalUsers / limit);

      if (page > total_pages) {
        throw new NotFoundException('Users not found');
      }

      return {
        data: users,
        meta_data: {
          total: totalUsers,
          current_page: page,
          limit,
          total_pages,
          prev: page > 1 ? page - 1 : null,
          next: page < total_pages ? page + 1 : null,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          DetailCounseling: {
            include: {
              Counseling: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const { password, ...userData } = user;

      if (user.role === 'teacher') {
        const totalRating = user.DetailCounseling.map((counseling) => {
          return counseling.Counseling.rating;
        });

        const sumRating = totalRating.reduce(
          (acc, currentValue) => acc + currentValue,
          0,
        );
        return { data: userData, totalRate: sumRating };
      }
      return { data: userData };
    } catch (err) {
      throw err;
    }
  }

  async update(id: string, dto: UpdateUserDto, file: Express.Multer.File) {
    try {
      const user = await this.findById(id);

      if (dto.email && dto.email !== user.email) {
        const user = await this.findByEmail(dto.email);
        if (user) {
          throw new ConflictException('Email sudah digunakan');
        }
      }

      const updateData: any = { ...dto };

      if (dto.password) {
        updateData.password = await hash(dto.password, 10);
      }

      if (file) {
        unlinkSync(user.photo);
        updateData.photo = file.path;
      }

      const update = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      throw new HttpException('User berhasil diubah', HttpStatus.OK);
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(
    user: any,
    dto: UpdateProfileDto,
    file: Express.Multer.File,
  ) {
    try {
      if (dto.email && dto.email !== user.email) {
        const user = await this.findByEmail(dto.email);
        if (user) {
          throw new ConflictException('Email sudah digunakan');
        }
      }

      const { oldPassword, ...payload } = dto;

      const updateData: any = { ...payload };

      if (dto.password || dto.oldPassword) {
        if (await compare(dto.oldPassword, user.password as string)) {
          updateData.password = await hash(dto.password, 10);
        } else {
          throw new BadRequestException('Password lama salah');
        }
      }

      if (file) {
        unlinkSync(user.photo);
        updateData.photo = file.path;
      }

      const update = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (update) {
        throw new HttpException('User berhasil diubah', HttpStatus.OK);
      }
    } catch (err) {
      throw err;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findById(id);
      if (user.photo !== null) {
        unlinkSync(user.photo);
      }
      const del = await this.prisma.user.delete({
        where: { id },
      });
      if (del) {
        throw new HttpException('User berhasil dihapus', HttpStatus.OK);
      }
    } catch (err) {
      throw err;
    }
  }

  async findById(id: string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!data) {
        throw new NotFoundException('User not found');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async findByRole(role: Role) {
    try {
      if (role === 'admin') {
        throw new NotFoundException('User not found');
      }
      const user = await this.prisma.user.findMany({
        where: { role: role },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  async findOneTeacher(id: string) {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id, role: 'teacher' },
        include: {
          DetailCounseling: {
            include: {
              Counseling: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      });
      if (!userData) {
        throw new NotFoundException('Teacher not found');
      }
      const { password, ...user } = userData;

      const totalRating = user.DetailCounseling.map((counseling) => {
        return counseling.Counseling.rating;
      });

      delete user.DetailCounseling;

      const sumRating = totalRating.reduce(
        (acc, currentValue) => acc + currentValue,
        0,
      );
      return { data: { user, rating: sumRating } };
    } catch (err) {
      throw err;
    }
  }

  async findOneStudent(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, role: 'student' },
      });
      if (!user) {
        throw new HttpException('Murid tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      const { password, rating, ...userData } = user;

      return { data: userData };
    } catch (err) {
      throw err;
    }
  }

  async findAllTeacher(options?: {
    page?: number;
    limit?: number;
    name?: string;
  }) {
    try {
      const { page = 0, limit = 0, name = null } = options || {};
      const skip = (page - 1) * limit;

      if (name !== null) {
        const users = await this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            class: true,
            photo: true,
            role: true,
            created_at: true,
            updated_at: true,
            rating: true,
            DetailCounseling: {
              include: {
                Counseling: {
                  select: {
                    rating: true,
                  },
                },
              },
            },
          },
          where: {
            name: {
              contains: name,
            },
            role: 'teacher',
          },
        });

        const totalTeacher = await this.prisma.user.count({
          where: {
            name: {
              contains: name,
            },
            role: 'teacher',
          },
        });
        const total_pages = Math.ceil(totalTeacher / limit);

        users.forEach((user) => {
          let total = 0;
          user.DetailCounseling.forEach((detail) => {
            total += detail.Counseling.rating;
          });
          user.rating = total;
          delete user.DetailCounseling;
        });

        if (page > total_pages) {
          throw new HttpException('Guru tidak ditemukan', HttpStatus.NOT_FOUND);
        }

        return {
          data: users,
          meta_data: {
            total: totalTeacher,
            current_page: page,
            limit,
            prev: page > 1 ? page - 1 : null,
            next: page < total_pages ? page + 1 : null,
          },
        };
      }

      if (Number.isNaN(limit) && Number.isNaN(page)) {
        throw new ForbiddenException('Parameters not included');
      }

      const users = await this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          class: true,
          photo: true,
          role: true,
          rating: true,
          created_at: true,
          updated_at: true,
          DetailCounseling: {
            include: {
              Counseling: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        where: {
          role: 'teacher',
        },
      });

      const totalTeacher = await this.prisma.user.count({
        where: {
          role: 'teacher',
        },
      });

      const total_pages = Math.ceil(totalTeacher / limit);

      if (page > total_pages) {
        throw new HttpException('Guru tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      users.forEach((user) => {
        let total = 0;
        user.DetailCounseling.forEach((detail) => {
          total += detail.Counseling.rating;
        });
        user.rating = total;
        delete user.DetailCounseling;
      });

      users.sort((a, b) => b.rating - a.rating);

      return {
        data: users,
        meta_data: {
          total: totalTeacher,
          current_page: page,
          limit,
          total_pages,
          prev: page > 1 ? page - 1 : null,
          next: page < total_pages ? page + 1 : null,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async teacherAvailable(options?: {
    page?: number;
    limit?: number;
    name?: string;
  }) {
    try {
      const { page = 0, limit = 0, name = null } = options || {};
      const skip = (page - 1) * limit;

      if (Number.isNaN(limit) && Number.isNaN(page)) {
        throw new ForbiddenException('Parameters not included');
      }

      const currentDate = new Date();
      const currentDateStr = currentDate.toISOString().split('T')[0]; // Get current date in format YYYY-MM-DD

      const users = await this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          class: true,
          photo: true,
          role: true,
          rating: true,
          created_at: true,
          updated_at: true,
          DetailCounseling: {
            where: {
              Counseling: {
                status: {
                  in: ['waiting', 'done', 'approved'],
                },
                AND: {
                  created_at: {
                    gte: `${currentDateStr}T00:00:00Z`, // Counseling scheduled for today or later
                    lt: `${currentDateStr}T23:59:59Z`, // Counseling scheduled for today
                  },
                },
              },
            },
            select: {
              Counseling: {
                select: {
                  rating: true,
                  status: true,
                  created_at: true,
                },
              },
            },
          },
        },
        where: {
          name: {
            contains: name || '', // Handle null name
          },
          role: 'teacher',
        },
      });

      const totalTeacher = await this.prisma.user.count({
        where: {
          role: 'teacher',
        },
      });

      const total_pages = Math.ceil(totalTeacher / limit);

      if (page > total_pages) {
        throw new HttpException('Guru tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      const data = users.filter((user) => user.DetailCounseling.length < 10);

      data.forEach((user) => {
        let total = 0;
        user.DetailCounseling.forEach((detail) => {
          total += detail.Counseling.rating;
        });
        user.rating = total;
        delete user.DetailCounseling;
      });

      data.sort((a, b) => b.rating - a.rating);

      return {
        data,
        meta_data: {
          total: totalTeacher,
          current_page: page,
          limit,
          total_pages,
          prev: page > 1 ? page - 1 : null,
          next: page < total_pages ? page + 1 : null,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async findAllStudents(options?: {
    page?: number;
    limit?: number;
    kelas?: string;
    name?: string;
  }) {
    try {
      const { page = 1, limit = 10, name = null, kelas = null } = options || {};
      const skip = (page - 1) * limit;

      if (isNaN(limit) || isNaN(page)) {
        throw new ForbiddenException('Parameters not included');
      }

      const whereCondition: any = {
        role: 'student',
      };

      if (kelas !== null) {
        whereCondition.class = kelas;
      }

      if (name !== null) {
        whereCondition.name = {
          contains: name || '',
        };
      }

      const data = await this.prisma.user.findMany({
        skip,
        take: limit,
        where: whereCondition,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          class: true,
          address: true,
          photo: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!data.length) {
        throw new HttpException('Murid tidak ditemukan', HttpStatus.OK);
      }

      const totalStudent = await this.prisma.user.count({
        where: whereCondition,
      });

      const total_pages = Math.ceil(totalStudent / limit);

      return {
        data,
        meta_data: {
          total: totalStudent,
          current_page: page,
          limit,
          total_pages,
          prev: page > 1 ? page - 1 : null,
          next: page < total_pages ? page + 1 : null,
        },
      };
    } catch (err) {
      throw err;
    }
  }
}
