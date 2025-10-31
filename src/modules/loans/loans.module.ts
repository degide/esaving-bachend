import { Module } from "@nestjs/common";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Module({
  providers: [PrismaService, LoansService],
  controllers: [LoansController],
})
export class LoansModule {}
