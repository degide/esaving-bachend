import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserHasRoles } from "@/common/decorators/auth.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { UserRole } from "@/modules/prisma/prisma.models";
import { Response } from "express";
import { UserStatsDTO } from "./dto/user-stats.dto";
import { AdminService } from "./admin.service";

@Controller({
  path: "api/admin",
  version: "1",
})
@ApiBearerAuth()
@ApiTags("Admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("userStats")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Get all user statistics [ADMIN]",
    description: "Retrieve system users' statistics.",
  })
  @ApiOkResponse({
    description: "User statistics",
    type: UserStatsDTO,
  })
  async getUserStats(@Res() res: Response) {
    const results = await this.adminService.getUserStats();
    return res.status(results.statusCode).json(results);
  }
}
