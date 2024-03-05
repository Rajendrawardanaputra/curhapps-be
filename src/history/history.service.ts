import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}
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
        throw new BadRequestException('Invalid parameter');
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
          throw new NotFoundException('Counseling not found');
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
                    note: true,
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
                  OR: [{ status: 'done' }, { status: 'rejected' }],
                  category: category,
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
                  note: true,
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
                OR: [{ status: 'done' }, { status: 'rejected' }],
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
                  note: true,
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
                OR: [{ status: 'done' }, { status: 'rejected' }],
              },
            },
          });

          const totalCounselings = await this.prisma.detailCounseling.count({
            where: {
              id_user: user.id,
              Counseling: {
                category: category,
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
                note: true,
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
              OR: [{ status: 'done' }, { status: 'rejected' }],
            },
          },
        });

        const totalCounselings = await this.prisma.detailCounseling.count({
          where: {
            id_user: user.id,
            Counseling: {
              OR: [{ status: 'done' }, { status: 'rejected' }],
            },
          },
        });
        const total_pages = Math.ceil(totalCounselings / limit);

        if (page > total_pages) {
          throw new NotFoundException('Counseling not found');
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
}
