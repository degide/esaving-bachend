import { Body, Controller, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDTO, PaginatedUserResBodyDTO, UserCreatedResponseDTO, UserResBodyDTO } from "./dto/user.dto";
import { Request, Response } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { User, UserRole } from "@/modules/prisma/prisma.models";
import { UserHasRoles } from "@/common/decorators/auth.decorator";

@Controller({
  path: "api/users",
  version: "1",
})
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UserHasRoles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieve a list of all users with pagination and search.",
  })
  @ApiQuery({ name: "page", minimum: 1, required: true, type: Number })
  @ApiQuery({ name: "limit", minimum: 10, required: true, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiOkResponse({
    description: "List of users",
    type: PaginatedUserResBodyDTO,
  })
  async getAllUsers(
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
  ) {
    const result = await this.usersService.getUsers(page, limit, search);
    return res.status(result.statusCode).json(result);
  }

  @Get("user-profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get user profile of the authenticated user.",
    description: "Retrieve the profile of the authenticated user.",
  })
  async getUserProfile(@Req() req: Request, @Res() res: Response) {
    const result = await this.usersService.getUserProfile((req.user as User).id);
    return res.status(result.statusCode).json(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new user",
    description: "Create a new user with the provided details.",
  })
  @ApiCreatedResponse({
    description: "User created",
    type: UserCreatedResponseDTO,
  })
  async createUser(@Res() res: Response, @Body() dto: CreateUserDTO) {
    const result = await this.usersService.createUser(dto);
    return res.status(result.statusCode).json(result);
  }
}
