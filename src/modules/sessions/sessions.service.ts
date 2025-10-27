import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateUserSessionDTO, PaginatedUserSessionDTO, UserSessionDTO, UserSessionResBodyDTO } from "./dto/session.dto";
import { plainToClass } from "class-transformer";
import { GeneralStatus, Prisma } from "../prisma/prisma.models";

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSessionByRefreshToken(refreshToken: string): Promise<UserSessionDTO | null> {
    const session = await this.prismaService.userSession.findUnique({
      where: { refreshToken },
    });

    return session ? plainToClass(UserSessionDTO, session) : null;
  }

  async getActiveSessionByUserId(userId: number): Promise<UserSessionDTO | null> {
    const session = await this.prismaService.userSession.findFirst({
      where: { userId, status: GeneralStatus.ACTIVE },
    });

    return session ? plainToClass(UserSessionDTO, session) : null;
  }

  async deactivateAllUserSessions(userId: number): Promise<void> {
    await this.prismaService.userSession.updateMany({
      where: { userId },
      data: {
        status: GeneralStatus.INACTIVE,
        expiresAt: new Date(Date.now()),
      },
    });
  }

  async getAllUserSessions(page: number, limit: number, userId: number, search?: string): Promise<PaginatedUserSessionDTO> {
    const where: Prisma.UserSessionWhereInput = search
      ? {
          userId,
          OR: [
            { deviceInfo: { contains: search, mode: "insensitive" } },
            { ipAddress: { contains: search, mode: "insensitive" } },
          ],
        }
      : { userId };

    const [userSessions, total] = await this.prismaService.$transaction([
      this.prismaService.userSession.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.userSession.count({
        where,
      }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "User sessions found",
      data: userSessions.map((session) =>
        plainToClass(UserSessionDTO, {
          ...session,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async createSession(dto: CreateUserSessionDTO): Promise<UserSessionResBodyDTO> {
    try {
      const newSession = await this.prismaService.userSession.create({
        data: {
          userId: dto.userId,
          refreshToken: dto.refreshToken,
          deviceInfo: dto.deviceInfo || undefined,
          ipAddress: dto.ipAddress || undefined,
          status: dto.status,
          expiresAt: dto.expiresAt,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: "Session created successfully",
        data: plainToClass(UserSessionDTO, newSession),
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to create session",
      };
    }
  }
}
