import { HttpStatus, Injectable } from "@nestjs/common";
import { UserStatsDTO } from "./dto/user-stats.dto";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { GeneralStatus } from "../prisma/prisma.models";
import { ResBodyDTO } from "@/common/dto/response.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserStats(): Promise<ResBodyDTO<UserStatsDTO>> {
    const [totalUsers, pendingUsers, activeUsers, inactiveUsers, suspendedUsers] = await this.prismaService.$transaction([
      this.prismaService.user.count(),
      this.prismaService.user.count({ where: { status: GeneralStatus.PENDING } }),
      this.prismaService.user.count({ where: { status: GeneralStatus.ACTIVE } }),
      this.prismaService.user.count({ where: { status: GeneralStatus.INACTIVE } }),
      this.prismaService.user.count({ where: { status: GeneralStatus.SUSPENDED } }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "success",
      data: {
        totalUsers,
        pendingUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
      },
    };
  }
}
