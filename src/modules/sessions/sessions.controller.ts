import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Controller, Get, ParseIntPipe, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiOkResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PaginatedUserResBodyDTO } from "@/modules/users/dto/user.dto";
import { PaginatedUserSessionDTO } from "./dto/session.dto";
import { SessionsService } from "./sessions.service";
import { Request, Response } from "express";
import { User } from "@/modules/prisma/prisma.models";

@Controller({
  path: "api/sessions",
  version: "1",
})
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get("userSessions")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get all user sessions",
    description: "Retrieve a list of all user sessions with pagination and search.",
  })
  @ApiQuery({ name: "page", minimum: 1, required: true, type: Number })
  @ApiQuery({ name: "limit", minimum: 10, required: true, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiOkResponse({
    description: "List of user sessions",
    type: PaginatedUserSessionDTO,
  })
  async getAllUserSessions(
    @Req() req: Request,
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
  ) {
    const result = await this.sessionsService.getAllUserSessions(page, limit, (req.user as User).id, search);
    return res.status(result.statusCode).json(result);
  }
}
