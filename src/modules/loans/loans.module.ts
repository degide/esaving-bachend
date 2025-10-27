import { Module } from "@nestjs/common";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";

@Module({
  providers: [LoansService],
  controllers: [LoansController],
})
export class LoansModule {}
