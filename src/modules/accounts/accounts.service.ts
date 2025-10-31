import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { AccountDTO } from "./dto/account.dto";
import { Prisma } from "../prisma/prisma.models";
import { AccountResBodyDTO, PaginatedAccountResBodyDTO, UserAccountsResBodyDTO } from "./dto/response.dto";
import { plainToClass } from "class-transformer";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string, userId?: number): Promise<PaginatedAccountResBodyDTO> {
    const where: Prisma.AccountWhereInput = {};
    if (userId) where.userId = userId;
    if (search) where.accountNumber = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.account.count({ where }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "Accounts found",
      data: data.map((account) =>
        plainToClass(AccountDTO, {
          ...account,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async findById(id: number): Promise<AccountResBodyDTO> {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) throw new NotFoundException("Account not found");

    return {
      statusCode: HttpStatus.OK,
      message: "Success",
      data: account,
    };
  }

  async findByUserId(userId: number): Promise<UserAccountsResBodyDTO> {
    const accounts = await this.prisma.account.findMany({ where: { userId } });

    return {
      statusCode: HttpStatus.OK,
      message: "Success",
      data: accounts,
    };
  }
}
