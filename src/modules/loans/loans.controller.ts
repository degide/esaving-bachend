import { Controller, Post, Body, UseGuards, Req, Res, HttpStatus, Get, Query, ParseIntPipe, Param, Put } from "@nestjs/common";
import { LoansService } from "./loans.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { UserHasRoles } from "@/common/decorators/auth.decorator";
import { UserRole, User } from "../prisma/prisma.models";
import { LoanRequestDTO, LoanRepayDTO, PaginatedLoanResBodyDTO, LoanDTO } from "./dto/loans.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { Response, Request } from "express";

@Controller({
  path: "api/loans",
  version: "1",
})
@ApiBearerAuth()
@ApiTags("Loans")
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post("request")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.CUSTOMER])
  @ApiOperation({ summary: "Request a loan [CUSTOMER]" })
  @ApiBody({ type: LoanRequestDTO })
  @ApiOkResponse({ description: "Created loan (pending)", type: LoanDTO })
  async requestLoan(@Req() req: Request, @Res() res: Response, @Body() dto: LoanRequestDTO) {
    const user = req.user as User;
    const result = await this.loansService.requestLoan(user.id, dto);
    return res.status(result.statusCode).json(result);
  }

  @Post("repay")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.CUSTOMER])
  @ApiOperation({ summary: "Repay a loan [CUSTOMER]" })
  @ApiBody({ type: LoanRepayDTO })
  @ApiOkResponse({ description: "Repayment transaction", type: Object })
  async repay(@Req() req: Request, @Res() res: Response, @Body() dto: LoanRepayDTO) {
    const user = req.user as User;
    const result = await this.loansService.repayLoan(user.id, dto);
    return res.status(result.statusCode).json(result);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get loans (paginated). Admins/CUSTOMERS can filter by userId" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "userId", required: false, type: Number })
  @ApiOkResponse({ description: "Paginated list of loans", type: PaginatedLoanResBodyDTO })
  async getAll(
    @Res() res: Response,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
    @Query("userId") userId?: number,
  ) {
    const result = await this.loansService.findAll(page, limit, search, userId);
    return res.status(result.statusCode).json(result);
  }

  @Put("approve/:loanId")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.ADMIN])
  @ApiOperation({ summary: "Approve a loan [ADMIN]" })
  @ApiParam({ name: "loanId", type: Number })
  @ApiOkResponse({ description: "Approved loan", type: LoanDTO })
  async approve(@Req() req: Request, @Res() res: Response, @Param("loanId", ParseIntPipe) loanId: number) {
    const admin = req.user as User;
    const result = await this.loansService.approveLoan(admin.id, loanId);
    return res.status(result.statusCode).json(result);
  }

  @Put("reject/:loanId")
  @UseGuards(JwtAuthGuard)
  @UserHasRoles([UserRole.ADMIN])
  @ApiOperation({ summary: "Reject a loan [ADMIN]" })
  @ApiParam({ name: "loanId", type: Number })
  @ApiOkResponse({ description: "Rejected loan", type: LoanDTO })
  async reject(@Req() req: Request, @Res() res: Response, @Param("loanId", ParseIntPipe) loanId: number) {
    const admin = req.user as User;
    const result = await this.loansService.rejectLoan(admin.id, loanId);
    return res.status(result.statusCode).json(result);
  }
}
