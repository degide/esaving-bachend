import { Controller, Post, Body, UseGuards, Req, Res, HttpStatus, Get, Query, ParseIntPipe } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { UserHasRoles } from "@/common/decorators/auth.decorator";
import { UserRole, User } from "../prisma/prisma.models";
import { DepositWithdrawDTO, PaginatedTransactionResBodyDTO, TransactionDTO } from "./dto/transactions.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Response, Request } from "express";

@Controller({
  path: "api/transactions",
  version: "1",
})
@ApiBearerAuth()
@ApiTags("Transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post("deposit")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.CUSTOMER])
  @ApiOperation({ summary: "Deposit funds", description: "Deposit funds into a user account [CUSTOMER]" })
  @ApiBody({ type: DepositWithdrawDTO })
  @ApiOkResponse({ description: "Deposit transaction", type: TransactionDTO })
  async deposit(@Req() req: Request, @Res() res: Response, @Body() dto: DepositWithdrawDTO) {
    const user = req.user as User;
    const result = await this.transactionsService.deposit(user.id, dto);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post("withdraw")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.CUSTOMER])
  @ApiOperation({ summary: "Withdraw funds", description: "Withdraw funds from a user account [CUSTOMER]" })
  @ApiBody({ type: DepositWithdrawDTO })
  @ApiOkResponse({ description: "Withdraw transaction", type: TransactionDTO })
  async withdraw(@Req() req: Request, @Res() res: Response, @Body() dto: DepositWithdrawDTO) {
    const user = req.user as User;
    const result = await this.transactionsService.withdraw(user.id, dto);
    return res.status(result.statusCode).json(result);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all transactions", description: "Get all transactions (paginated, optional userId filter)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "userId", required: false, type: Number })
  @ApiOkResponse({ description: "Paginated list of transactions", type: PaginatedTransactionResBodyDTO })
  async getAll(
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
    @Query("userId") userId?: number,
  ) {
    const result = await this.transactionsService.findAll(page, limit, search, userId);
    return res.status(result.statusCode).json(result);
  }
}
