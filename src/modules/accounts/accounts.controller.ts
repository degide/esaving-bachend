import { Controller, Get, Param, Query, ParseIntPipe, UseGuards, Res } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { Response } from "express";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AccountDTO } from "./dto/account.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { AccountResBodyDTO, PaginatedAccountResBodyDTO, UserAccountsResBodyDTO } from "./dto/response.dto";
import { UserHasAnyRole, UserHasRoles } from "@/common/decorators/auth.decorator";
import { UserRole } from "../prisma/prisma.models";

@Controller({
  path: "api/accounts",
  version: "1",
})
@ApiBearerAuth()
@ApiTags("Accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.ADMIN])
  @ApiOperation({
    summary: "Get all accounts (paginated, searchable) [ADMIN]",
    description: "Retrieve a paginated list of accounts. Optionally filter by userId and search by account number.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "userId", required: false, type: Number })
  @ApiOkResponse({
    description: "Paginated list of accounts",
    type: PaginatedAccountResBodyDTO,
  })
  async getAll(
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
    @Query("userId") userId?: number,
  ) {
    const result = await this.accountsService.findAll(page, limit, search, userId);
    return res.status(result.statusCode).json(result);
  }

  @Get("userAccounts/:userId")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: "Get accounts by userId [CUSTOMER]",
    description: "Retrieve all accounts belonging to a specific user.",
  })
  @ApiParam({ name: "userId", type: Number })
  @ApiOkResponse({
    description: "List of accounts for the user",
    type: UserAccountsResBodyDTO,
  })
  async getByUserId(@Res() res: Response, @Param("userId", ParseIntPipe) userId: number) {
    const result = await this.accountsService.findByUserId(userId);
    return res.status(result.statusCode).json(result);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @UserHasAnyRole([UserRole.ADMIN, UserRole.CASHIER, UserRole.CUSTOMER])
  @ApiOperation({
    summary: "Get account by id [CUSTOMER, CASHIER, ADMIN]",
    description: "Retrieve a single account by its id.",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({
    description: "Account details",
    type: AccountResBodyDTO,
  })
  async getById(@Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    const result = await this.accountsService.findById(id);
    return res.status(result.statusCode).json(result);
  }
}
