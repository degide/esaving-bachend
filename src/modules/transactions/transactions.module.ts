import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [TransactionsController],
  providers: [PrismaService, TransactionsService],
})
export class TransactionsModule {}
