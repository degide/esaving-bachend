import { Injectable, BadRequestException, NotFoundException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  DepositWithdrawDTO,
  TransactionDTO,
  PaginatedTransactionResBodyDTO,
  TransactionResBodyDTO,
} from "./dto/transactions.dto";
import { TransactionType, TransactionStatus, Prisma } from "../prisma/prisma.models";
import { plainToClass } from "class-transformer";

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async deposit(userId: number, dto: DepositWithdrawDTO): Promise<TransactionResBodyDTO> {
    const account = await this.prismaService.account.findUnique({ where: { id: dto.accountId } });
    if (!account || account.userId !== userId) throw new NotFoundException("Account not found");

    const [updatedAccount, transaction] = await this.prismaService.$transaction([
      this.prismaService.account.update({
        where: { id: dto.accountId },
        data: { balance: { increment: dto.amount } },
      }),
      this.prismaService.transaction.create({
        data: {
          destinationAccountId: dto.accountId,
          type: TransactionType.DEPOSIT,
          amount: dto.amount,
          status: TransactionStatus.COMPLETED,
          description: dto.description,
        },
      }),
    ]);
    return {
      statusCode: HttpStatus.OK,
      message: "Deposit successful.",
      data: plainToClass(TransactionDTO, transaction),
    };
  }

  async withdraw(userId: number, dto: DepositWithdrawDTO): Promise<TransactionResBodyDTO> {
    const account = await this.prismaService.account.findUnique({ where: { id: dto.accountId } });
    if (!account || account.userId !== userId) throw new NotFoundException("Account not found");
    if (account.balance < dto.amount) throw new BadRequestException("Insufficient funds");

    const [updatedAccount, transaction] = await this.prismaService.$transaction([
      this.prismaService.account.update({
        where: { id: dto.accountId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prismaService.transaction.create({
        data: {
          sourceAccountId: dto.accountId,
          type: TransactionType.WITHDRAWAL,
          amount: dto.amount,
          status: TransactionStatus.COMPLETED,
          description: dto.description,
        },
      }),
    ]);
    return {
      statusCode: HttpStatus.OK,
      message: "Withdraw successful.",
      data: plainToClass(TransactionDTO, transaction),
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, userId?: number): Promise<PaginatedTransactionResBodyDTO> {
    const where: Prisma.TransactionWhereInput = {};
    if (userId) where.OR = [{ sourceAccount: { userId } }, { destinationAccount: { userId } }];
    if (search) where.description = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prismaService.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { sourceAccount: true, destinationAccount: true },
      }),
      this.prismaService.transaction.count({ where }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "Success",
      data: data.map((t) => plainToClass(TransactionDTO, t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}
