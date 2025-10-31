import { Controller, Get, Query, ParseIntPipe, UseGuards, Res, Req } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Request, Response } from "express";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PaginatedNotificationResBodyDTO } from "./dto/response.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { User } from "../prisma/prisma.models";

@Controller({
  path: "api/notifications",
  version: "1",
})
@ApiBearerAuth()
@ApiTags("Notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get all notifications (paginated, searchable)",
    description: "Retrieve a paginated list of notifications. Optionally filter by userId and search by message.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiOkResponse({
    description: "Paginated list of notifications",
    type: PaginatedNotificationResBodyDTO,
  })
  async getAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
  ) {
    const result = await this.notificationsService.findAll(page, limit, search, (req.user as User).id);
    return res.status(result.statusCode).json(result);
  }
}
