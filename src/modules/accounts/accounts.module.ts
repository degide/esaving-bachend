import { Module } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AccountsController } from "./accounts.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  providers: [PrismaService, AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
