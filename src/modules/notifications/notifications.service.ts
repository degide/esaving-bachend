import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationType, Prisma } from "@/modules/prisma/prisma.models";
import { PaginatedNotificationResBodyDTO } from "./dto/response.dto";
import { plainToClass } from "class-transformer";
import { NotificationDTO } from "./dto/notification.dto";

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: number,
  ): Promise<PaginatedNotificationResBodyDTO> {
    const where: Prisma.NotificationWhereInput = {};
    if (userId) where.userId = userId;
    if (search) where.message = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prismaService.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.notification.count({ where }),
    ]);

    return {
      data: data.map((n) => plainToClass(NotificationDTO, n)),
      statusCode: HttpStatus.OK,
      message: "Success",
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async createNotification(
    userId: number,
    message: string,
    type: NotificationType = NotificationType.GENERAL_MESSAGE,
  ): Promise<NotificationDTO> {
    const notification = await this.prismaService.notification.create({
      data: {
        userId,
        message,
        type,
      },
    });
    return plainToClass(NotificationDTO, notification);
  }
}
