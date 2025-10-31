import { Injectable, NotFoundException, BadRequestException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoanRequestDTO, LoanRepayDTO, PaginatedLoanResBodyDTO, LoanResBodyDTO, LoanDTO } from "./dto/loans.dto";
import { LoanStatus, TransactionType, TransactionStatus, AccountType, Prisma } from "@/modules/prisma/prisma.models";
import { plainToClass } from "class-transformer";

@Injectable()
export class LoansService {
  constructor(private readonly prismaService: PrismaService) {}

  async requestLoan(userId: number, dto: LoanRequestDTO): Promise<LoanResBodyDTO> {
    const years = dto.termInMonths / 12;
    const totalPayable = dto.requestedAmount + dto.requestedAmount * (dto.interestRate / 100) * years;

    const loan = await this.prismaService.loan.create({
      data: {
        userId,
        requestedAmount: dto.requestedAmount,
        disbursedAmount: 0,
        totalPayable,
        interestRate: dto.interestRate,
        termInMonths: dto.termInMonths,
        status: LoanStatus.PENDING,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: "Loan request received",
      data: plainToClass(LoanDTO, loan),
    };
  }

  async repayLoan(userId: number, dto: LoanRepayDTO): Promise<LoanResBodyDTO> {
    const loan = await this.prismaService.loan.findUnique({ where: { id: dto.loanId } });
    if (!loan) throw new NotFoundException("Loan not found");
    if (loan.userId !== userId) throw new BadRequestException("Not your loan");
    if (![LoanStatus.ACTIVE.toUpperCase(), LoanStatus.APPROVED.toUpperCase()].includes(loan.status.toUpperCase()))
      throw new BadRequestException("Loan not payable in current status");

    const payerAccount = await this.prismaService.account.findUnique({ where: { id: dto.accountId } });
    if (!payerAccount || payerAccount.userId !== userId) throw new NotFoundException("Payer account not found");
    if (payerAccount.balance < dto.amount) throw new BadRequestException("Insufficient funds");

    // find system float account as destination
    const systemFloat = await this.prismaService.account.findFirst({ where: { accountType: AccountType.SYSTEM_FLOAT } });
    if (!systemFloat) throw new NotFoundException("System float account not configured");

    // perform atomic update: decrement payer, increment float, create transaction linked to loan
    const [updatedPayer, updatedFloat, transaction, updatedLoan] = await this.prismaService.$transaction([
      this.prismaService.account.update({
        where: { id: payerAccount.id },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prismaService.account.update({
        where: { id: systemFloat.id },
        data: { balance: { increment: dto.amount } },
      }),
      this.prismaService.transaction.create({
        data: {
          sourceAccountId: payerAccount.id,
          destinationAccountId: systemFloat.id,
          type: TransactionType.LOAN_REPAYMENT,
          amount: dto.amount,
          status: TransactionStatus.COMPLETED,
          description: dto.description ?? null,
          loanId: loan.id,
        },
      }),
      // update loan outstanding: reduce totalPayable; if <=0 mark PAID_OFF
      this.prismaService.loan.update({
        where: { id: loan.id },
        data: {
          totalPayable: { decrement: dto.amount },
          status: loan.totalPayable - dto.amount <= 0 ? LoanStatus.PAID_OFF : LoanStatus.ACTIVE,
        },
      }),
    ]);

    return {
      statusCode: HttpStatus.CREATED,
      message: "Loan payment successful",
      data: plainToClass(LoanDTO, loan),
    };
  }

  async findAll(page = 1, limit = 10, search?: string, userId?: number): Promise<PaginatedLoanResBodyDTO> {
    const where: Prisma.LoanWhereInput = {};
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prismaService.loan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.loan.count({ where }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "Success",
      data: data.map((l) => plainToClass(LoanDTO, l)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async approveLoan(adminId: number, loanId: number): Promise<LoanResBodyDTO> {
    const loan = await this.prismaService.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException("Loan not found");

    const updated = await this.prismaService.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.APPROVED,
        approvedById: adminId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: "Loan approved successfully",
      data: plainToClass(LoanDTO, updated),
    };
  }

  async rejectLoan(adminId: number, loanId: number): Promise<LoanResBodyDTO> {
    const loan = await this.prismaService.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException("Loan not found");

    const updated = await this.prismaService.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.REJECTED,
        approvedById: adminId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: "Loan rejected successfully",
      data: plainToClass(LoanDTO, updated),
    };
  }
}
