import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { CreateCounselingDto } from './dto/create-counseling.dto';
import { UpdateCounselingDto } from './dto/update-counseling.dto';
import { PrismaService } from 'src/prisma.service';
import * as moment from 'moment-timezone';
import { RoomService } from 'src/room/room.service';
import { CreateCounselingDto } from './dto/create-counseling.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CounselingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomService: RoomService,
  ) {}

  async create(payload: CreateCounselingDto) {
    try {
      // if (user.role === 'teacher') {
      //   const counseling = await this.prisma.detailCounseling.count({
      //     where: {
      //       id_user: user.id,
      //       Counseling: {
      //         OR: [
      //           { status: 'done' },
      //           { status: 'approved' },
      //           { status: 'waiting' },
      //         ],
      //       },
      //     },
      //   });
      // }

      let create: any;
      if (payload.category === 'offline') {
        create = await this.prisma.counseling.create({
          data: {
            category: 'offline',
            status: payload.status,
            created_at: new Date(payload.date),
          },
        });
        await this.prisma.offline.create({
          data: {
            id_counseling: create.id,
            date: new Date(payload.date),
          },
        });
      } else {
        create = await this.prisma.counseling.create({
          data: {
            category: 'online',
            status: 'approved',
          },
        });

        const room = await this.roomService.create({
          status: true,
        });
        await this.prisma.online.create({
          data: {
            id_counseling: create.id,
            id_room: room.data.id,
          },
        });
      }

      await this.prisma.detailCounseling.createMany({
        data: [
          { id_counseling: create.id, id_user: payload.id_student },
          { id_counseling: create.id, id_user: payload.id_teacher },
        ],
      });
      return { message: 'Counseling created successfully' };
    } catch (err) {
      throw err;
    }
  }

  async findAll(
    req: any,
    options?: {
      page?: number;
      limit?: number;
      date?: string;
      category?: Category;
      id_user?: string;
    },
  ) {
    try {
      const {
        page = req.page,
        limit = req.limit,
        date = req.date || null,
        category = req.category || null,
        id_user = req.id_user || null,
      } = options || {};
      const user = req.user;
      const skip = (page - 1) * limit;

      if (Number.isNaN(limit) || Number.isNaN(page)) {
        if (category !== null) {
          const nextCounseling = await this.prisma.detailCounseling.findFirst({
            where: {
              id_user: user.id,
              Counseling: {
                NOT: [{ status: 'done' }, { status: 'rejected' }],
                category: category,
              },
            },
            orderBy: {
              created_at: 'desc',
            },
            select: {
              id_counseling: true,
              id_user: true,
              Counseling: {
                select: {
                  note: true,
                  rating: true,
                  status: true,

                  category: true,
                  created_at: true,
                  updated_at: true,
                  Online: {
                    select: {
                      Room: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                  Offline: {
                    select: {
                      date: true,
                    },
                  },
                  DetailCounseling: {
                    where: {
                      id_user: {
                        not: user.id,
                      },
                    },
                    select: {
                      User: {
                        select: {
                          id: true,
                          name: true,
                          photo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          const lastCounseling = await this.prisma.detailCounseling.findFirst({
            where: {
              id_user: user.id,
              Counseling: {
                OR: [{ status: 'done' }, { status: 'rejected' }],
                category: category,
              },
            },
            orderBy: {
              updated_at: 'desc',
            },
            select: {
              id_counseling: true,
              id_user: true,
              Counseling: {
                select: {
                  note: true,
                  rating: true,
                  status: true,

                  category: true,
                  created_at: true,
                  updated_at: true,
                  Online: {
                    select: {
                      Room: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                  Offline: {
                    select: {
                      date: true,
                    },
                  },
                  DetailCounseling: {
                    where: {
                      id_user: {
                        not: user.id,
                      },
                    },
                    select: {
                      User: {
                        select: {
                          id: true,
                          name: true,
                          photo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          return {
            nextCounseling,
            lastCounseling,
          };
        }
        const nextCounseling = await this.prisma.detailCounseling.findFirst({
          where: {
            id_user: user.id,
            Counseling: {
              NOT: [{ status: 'done' }, { status: 'rejected' }],
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          select: {
            id_counseling: true,
            id_user: true,
            Counseling: {
              select: {
                note: true,
                rating: true,
                status: true,

                category: true,
                created_at: true,
                updated_at: true,
                Online: {
                  select: {
                    Room: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
                Offline: {
                  select: {
                    date: true,
                  },
                },
                DetailCounseling: {
                  where: {
                    id_user: {
                      not: user.id,
                    },
                  },
                  select: {
                    User: {
                      select: {
                        id: true,
                        name: true,
                        photo: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const lastCounseling = await this.prisma.detailCounseling.findFirst({
          where: {
            id_user: user.id,
            Counseling: {
              OR: [{ status: 'done' }, { status: 'rejected' }],
            },
          },
          orderBy: {
            updated_at: 'desc',
          },
          select: {
            id_counseling: true,
            id_user: true,
            Counseling: {
              select: {
                note: true,
                rating: true,
                status: true,

                category: true,
                created_at: true,
                updated_at: true,
                Online: {
                  select: {
                    Room: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
                Offline: {
                  select: {
                    date: true,
                  },
                },
                DetailCounseling: {
                  where: {
                    id_user: {
                      not: user.id,
                    },
                  },
                  select: {
                    User: {
                      select: {
                        id: true,
                        name: true,
                        photo: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        return {
          nextCounseling,
          lastCounseling,
        };
      }

      if (user.role === 'admin') {
        if (date !== null) {
          const startOfDay =
            moment(date).format('YYYY-MM-DD') + 'T00:00:00.000Z';
          const endOfDay = moment(date).format('YYYY-MM-DD') + 'T17:59:59.999Z';

          if (id_user !== null) {
            const Counselings = await this.prisma.counseling.findMany({
              skip,
              take: limit,
              orderBy: {
                created_at: 'desc',
              },
              where: {
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              include: {
                DetailCounseling: {
                  where: {
                    id_user: id_user,
                  },
                  select: {
                    User: {
                      select: {
                        name: true,
                        role: true,
                        photo: true,
                      },
                    },
                  },
                },
                Online: {
                  select: {
                    Room: {
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
                Offline: {
                  select: {
                    date: true,
                  },
                },
              },
            });

            let totalCounselings = await this.prisma.counseling.findMany({
              where: {
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              include: {
                DetailCounseling: {
                  where: {
                    id_user: id_user,
                  },
                },
              },
            });

            totalCounselings = totalCounselings.filter((counseling) => {
              return counseling.DetailCounseling.length > 0;
            });
            const total_pages = Math.ceil(totalCounselings.length / limit);

            if (page > total_pages) {
              throw new HttpException('Counseling not found', HttpStatus.OK);
            }

            return {
              data: Counselings,
              meta_data: {
                total: totalCounselings.length,
                current_page: page,
                limit,
                total_pages,
                prev: page > 1 ? page - 1 : null,
                next: page < total_pages ? page + 1 : null,
              },
            };
          }

          if (category !== null) {
            const Counselings = await this.prisma.counseling.findMany({
              skip,
              take: limit,
              orderBy: {
                created_at: 'desc',
              },
              where: {
                category: category,
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              include: {
                DetailCounseling: {
                  select: {
                    User: {
                      select: {
                        name: true,
                        role: true,
                        photo: true,
                      },
                    },
                  },
                },
                Online: {
                  select: {
                    Room: {
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
                Offline: {
                  select: {
                    date: true,
                  },
                },
              },
            });

            const totalCounselings = await this.prisma.counseling.count({
              where: {
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
                category: category,
              },
            });
            const total_pages = Math.ceil(totalCounselings / limit);

            if (page > total_pages) {
              throw new HttpException('Counseling not found', HttpStatus.OK);
            }

            return {
              data: Counselings,
              meta_data: {
                total: totalCounselings,
                current_page: page,
                limit,
                total_pages,
                prev: page > 1 ? page - 1 : null,
                next: page < total_pages ? page + 1 : null,
              },
            };
          }

          const Counselings = await this.prisma.counseling.findMany({
            skip,
            take: limit,
            orderBy: {
              created_at: 'desc',
            },
            where: {
              created_at: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            include: {
              DetailCounseling: {
                select: {
                  User: {
                    select: {
                      name: true,
                      role: true,
                      photo: true,
                    },
                  },
                },
              },
              Online: {
                select: {
                  Room: {
                    select: {
                      id: true,
                      status: true,
                    },
                  },
                },
              },
              Offline: {
                select: {
                  date: true,
                },
              },
            },
          });

          const totalCounselings = await this.prisma.counseling.count({
            where: {
              created_at: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
          const total_pages = Math.ceil(totalCounselings / limit);

          if (page > total_pages) {
            throw new HttpException('Counseling not found', HttpStatus.OK);
          }

          return {
            data: Counselings,
            meta_data: {
              total: totalCounselings,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        if (id_user !== null) {
          const Counselings = await this.prisma.counseling.findMany({
            skip,
            take: limit,
            orderBy: {
              created_at: 'desc',
            },
            include: {
              DetailCounseling: {
                where: {
                  id_user: id_user,
                },
                select: {
                  User: {
                    select: {
                      name: true,
                      role: true,
                      photo: true,
                    },
                  },
                },
              },
              Online: {
                select: {
                  Room: {
                    select: {
                      id: true,
                      status: true,
                    },
                  },
                },
              },
              Offline: {
                select: {
                  date: true,
                },
              },
            },
          });

          const totalCounselings = await this.prisma.counseling.findMany({
            orderBy: {
              created_at: 'desc',
            },
            include: {
              DetailCounseling: {
                where: {
                  id_user: id_user,
                },
              },
            },
          });
          const total_pages = Math.ceil(totalCounselings.length / limit);

          if (page > total_pages) {
            throw new HttpException('Counseling not found', HttpStatus.OK);
          }

          return {
            data: Counselings,
            meta_data: {
              total: totalCounselings.length,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        if (category !== null) {
          const Counselings = await this.prisma.counseling.findMany({
            skip,
            take: limit,
            orderBy: {
              created_at: 'desc',
            },
            where: {
              category: category,
            },
            include: {
              DetailCounseling: {
                select: {
                  User: {
                    select: {
                      name: true,
                      role: true,
                      photo: true,
                    },
                  },
                },
              },
              Online: {
                select: {
                  Room: {
                    select: {
                      id: true,
                      status: true,
                    },
                  },
                },
              },
              Offline: {
                select: {
                  date: true,
                },
              },
            },
          });

          const totalCounselings = await this.prisma.counseling.count({
            where: {
              category: category,
            },
          });
          const total_pages = Math.ceil(totalCounselings / limit);

          if (page > total_pages) {
            throw new HttpException('Counseling not found', HttpStatus.OK);
          }

          return {
            data: Counselings,
            meta_data: {
              total: totalCounselings,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        const Counselings = await this.prisma.counseling.findMany({
          skip,
          take: limit,
          include: {
            DetailCounseling: {
              select: {
                User: {
                  select: {
                    name: true,
                    role: true,
                    photo: true,
                  },
                },
              },
            },
            Online: {
              select: {
                Room: {
                  select: {
                    id: true,
                    status: true,
                  },
                },
              },
            },
            Offline: {
              select: {
                date: true,
              },
            },
          },
        });

        const totalCounselings = await this.prisma.counseling.count();
        const total_pages = Math.ceil(totalCounselings / limit);

        if (page > total_pages) {
          throw new HttpException('Counseling not found', HttpStatus.OK);
        }

        return {
          data: Counselings,
          meta_data: {
            total: totalCounselings,
            current_page: page,
            limit,
            total_pages,
            prev: page > 1 ? page - 1 : null,
            next: page < total_pages ? page + 1 : null,
          },
        };
      } else {
        if (date !== null) {
          const startOfDay =
            moment(date).format('YYYY-MM-DD') + 'T00:00:00.000Z';
          const endOfDay = moment(date).format('YYYY-MM-DD') + 'T17:59:59.999Z';

          if (id_user !== null) {
            throw new UnauthorizedException();
          }

          if (category !== null) {
            const Counselings = await this.prisma.detailCounseling.findMany({
              skip,
              take: limit,
              orderBy: {
                Counseling: {
                  created_at: 'desc',
                },
              },
              select: {
                id_counseling: true,
                id_user: true,
                Counseling: {
                  select: {
                    rating: true,
                    status: true,

                    category: true,
                    created_at: true,
                    updated_at: true,
                    Online: {
                      select: {
                        Room: {
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                    Offline: {
                      select: {
                        date: true,
                      },
                    },
                    DetailCounseling: {
                      where: {
                        id_user: {
                          not: user.id,
                        },
                      },
                      select: {
                        User: {
                          select: {
                            id: true,
                            name: true,
                            photo: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              where: {
                id_user: user.id,
                Counseling: {
                  created_at: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                  category: category,
                  status: {
                    not: 'done',
                  },
                },
              },
            });

            const totalCounselings = await this.prisma.detailCounseling.count({
              where: {
                id_user: user.id,
                Counseling: {
                  created_at: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                  category: category,
                  status: {
                    not: 'done',
                  },
                },
              },
            });
            const total_pages = Math.ceil(totalCounselings / limit);

            if (page > total_pages) {
              throw new HttpException('Counseling not found', HttpStatus.OK);
            }

            return {
              data: Counselings,
              meta_data: {
                total: totalCounselings,
                current_page: page,
                limit,
                total_pages,
                prev: page > 1 ? page - 1 : null,
                next: page < total_pages ? page + 1 : null,
              },
            };
          }

          const Counselings = await this.prisma.detailCounseling.findMany({
            skip,
            take: limit,
            orderBy: {
              Counseling: {
                created_at: 'desc',
              },
            },
            select: {
              id_counseling: true,
              id_user: true,
              Counseling: {
                select: {
                  rating: true,
                  status: true,

                  category: true,
                  created_at: true,
                  updated_at: true,
                  Online: {
                    select: {
                      Room: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                  Offline: {
                    select: {
                      date: true,
                    },
                  },
                  DetailCounseling: {
                    where: {
                      id_user: {
                        not: user.id,
                      },
                    },
                    select: {
                      User: {
                        select: {
                          id: true,
                          name: true,
                          photo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            where: {
              id_user: user.id,
              Counseling: {
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
                NOT: [{ status: 'done' }, { status: 'rejected' }],
              },
            },
          });

          const totalCounselings = await this.prisma.detailCounseling.count({
            where: {
              id_user: user.id,
              Counseling: {
                created_at: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
                NOT: [{ status: 'done' }, { status: 'rejected' }],
              },
            },
          });

          const total_pages = Math.ceil(totalCounselings / limit);

          if (page > total_pages) {
            throw new HttpException('Counseling not found', HttpStatus.OK);
          }

          return {
            data: Counselings,
            meta_data: {
              total: totalCounselings,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        if (id_user !== null) {
          throw new UnauthorizedException();
        }

        if (category !== null) {
          const Counselings = await this.prisma.detailCounseling.findMany({
            skip,
            take: limit,
            orderBy: {
              Counseling: {
                created_at: 'desc',
              },
            },
            select: {
              id_counseling: true,
              id_user: true,
              Counseling: {
                select: {
                  rating: true,
                  status: true,

                  category: true,
                  created_at: true,
                  updated_at: true,
                  Online: {
                    select: {
                      Room: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                  Offline: {
                    select: {
                      date: true,
                    },
                  },
                  DetailCounseling: {
                    where: {
                      id_user: {
                        not: user.id,
                      },
                    },
                    select: {
                      User: {
                        select: {
                          id: true,
                          name: true,
                          photo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            where: {
              id_user: user.id,
              Counseling: {
                category: category,
                NOT: [{ status: 'done' }, { status: 'rejected' }],
              },
            },
          });

          const totalCounselings = await this.prisma.detailCounseling.count({
            where: {
              id_user: user.id,
              Counseling: {
                category: category,
                NOT: [{ status: 'done' }, { status: 'rejected' }],
              },
            },
          });
          const total_pages = Math.ceil(totalCounselings / limit);

          if (page > total_pages) {
            throw new HttpException('Counseling not found', HttpStatus.OK);
          }

          return {
            data: Counselings,
            meta_data: {
              total: totalCounselings,
              current_page: page,
              limit,
              total_pages,
              prev: page > 1 ? page - 1 : null,
              next: page < total_pages ? page + 1 : null,
            },
          };
        }

        const Counselings = await this.prisma.detailCounseling.findMany({
          skip,
          take: limit,
          orderBy: {
            Counseling: {
              created_at: 'desc',
            },
          },
          select: {
            id_counseling: true,
            id_user: true,
            Counseling: {
              select: {
                rating: true,
                status: true,

                category: true,
                created_at: true,
                updated_at: true,
                Online: {
                  select: {
                    Room: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
                Offline: {
                  select: {
                    date: true,
                  },
                },
                DetailCounseling: {
                  where: {
                    id_user: {
                      not: user.id,
                    },
                  },
                  select: {
                    User: {
                      select: {
                        id: true,
                        name: true,
                        photo: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: {
            id_user: user.id,
            Counseling: {
              status: {
                not: 'done',
              },
            },
          },
        });

        const totalCounselings = await this.prisma.detailCounseling.count({
          where: {
            id_user: user.id,
            Counseling: {
              status: {
                not: 'done',
              },
            },
          },
        });
        const total_pages = Math.ceil(totalCounselings / limit);

        if (page > total_pages) {
          throw new HttpException('Counseling not found', HttpStatus.OK);
        }

        return {
          data: Counselings,
          meta_data: {
            total: totalCounselings,
            current_page: page,
            limit,
            total_pages,
            prev: page > 1 ? page - 1 : null,
            next: page < total_pages ? page + 1 : null,
          },
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: string) {
    try {
      return await this.findByIdRelation(id);
    } catch (err) {
      throw err;
    }
  }

  // async update(id: string, updateCounselingDto: UpdateCounselingDto) {
  //   try {
  //     const conseling = await this.findByIdRelation(id);

  //     if (conseling.status !== 'rejected' && conseling.status !== 'done') {
  //       const update = await this.prisma.counseling.update({
  //         where: { id },
  //         data: {
  //           status: updateCounselingDto.status,
  //           note: updateCounselingDto.note,
  //         },
  //       });

  //       if (update) {
  //         if (update.status === 'done' && update.category === 'online') {
  //           await this.prisma.room.updateMany({
  //             where: {
  //               id: { in: conseling.Online.map((data) => data.id_room) },
  //             },
  //             data: {
  //               status: false,
  //             },
  //           });
  //         }
  //         return new HttpException(
  //           'Counseling berhasil di update',
  //           HttpStatus.OK,
  //         );
  //       }
  //     } else if (conseling.status === 'done') {
  //       await this.prisma.counseling.update({
  //         where: { id },
  //         data: {
  //           rating: updateCounselingDto.rating,
  //         },
  //       });
  //       throw new ForbiddenException('Cannot update this counseling');
  //     }
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async update(
    id: string,
    updateCounselingDto: UpdateCounselingDto,
    user: any,
  ) {
    try {
      const counseling = await this.findByIdRelation(id);

      if (user.role === 'teacher') {
        if (counseling.status === 'approved') {
          const update = await this.prisma.counseling.update({
            where: { id },
            data: {
              status: 'done',
              note: updateCounselingDto.note,
            },
          });
          if (update.category === 'online') {
            await this.prisma.room.updateMany({
              where: {
                id: { in: counseling.Online.map((data) => data.id_room) },
              },
              data: {
                status: false,
              },
            });
          }
          throw new HttpException('Konseling berhasil diakhiri', HttpStatus.OK);
        }

        await this.prisma.counseling.update({
          where: { id },
          data: {
            status: updateCounselingDto.status,
            note: updateCounselingDto.note,
          },
        });

        throw new HttpException(
          `Konseling ${updateCounselingDto.status}`,
          HttpStatus.OK,
        );
      }
      if (user.role === 'student') {
        if (counseling.status === 'reject') {
          await this.prisma.counseling.update({
            where: { id },
            data: { status: 'rejected' },
          });
          return new HttpException('Konseling telah berakhir', HttpStatus.OK);
        }
        if (counseling.status === 'done') {
          if (
            updateCounselingDto.rating !== null &&
            updateCounselingDto.rating !== undefined
          ) {
            await this.prisma.counseling.update({
              where: { id },
              data: { rating: updateCounselingDto.rating },
            });
            return new HttpException('Berhasil memberi rating', HttpStatus.OK);
          } else {
            throw new ForbiddenException(
              'Tidak bisa memperbarui konseling ini',
            );
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async remove(id: string) {
    try {
      await this.findByIdRelation(id);

      const del = await this.prisma.counseling.delete({
        where: { id },
      });

      if (del) {
        return new HttpException('Counseling berhasil dihapus', HttpStatus.OK);
      }
    } catch (err) {
      throw err;
    }
  }

  async findByIdRelation(id: string) {
    try {
      const counsling = await this.prisma.counseling.findUnique({
        where: { id },
        include: {
          DetailCounseling: {
            include: {
              User: {
                select: {
                  role: true,
                },
              },
            },
          },
          Online: {
            include: {
              Room: true,
            },
          },
          Offline: true,
        },
      });

      if (!counsling) {
        throw new NotFoundException('Counseling not found');
      }

      if (counsling.category !== 'online') {
        delete counsling.Online;
      }

      if (counsling.category !== 'offline') {
        delete counsling.Offline;
      }

      return counsling;
    } catch (err) {
      throw err;
    }
  }

  async findById(id: string) {
    try {
      const counsling = await this.prisma.counseling.findUnique({
        where: { id },
      });

      if (!counsling) {
        throw new NotFoundException('Counseling not found');
      }

      return counsling;
    } catch (err) {
      throw err;
    }
  }
}
