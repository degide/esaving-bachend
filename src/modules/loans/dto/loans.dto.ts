import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsPositive, Min, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { Loan, LoanStatus } from "@/modules/prisma/prisma.models";
import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";

export class LoanRequestDTO {
  @ApiProperty({ description: "Requested principal amount", example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  requestedAmount: number;

  @ApiProperty({ description: "Loan term in months", example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  termInMonths: number;

  @ApiProperty({ description: "Annual interest rate (percentage)", example: 12.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  interestRate: number;
}

export class LoanRepayDTO {
  @ApiProperty({ description: "Loan id to repay", example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  loanId: number;

  @ApiProperty({ description: "Account id to debit for repayment", example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  accountId: number;

  @ApiProperty({ description: "Repayment amount", example: 500 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: "Optional description for the repayment" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class LoanDTO implements Loan {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ description: "Amount requested by user" })
  requestedAmount: number;

  @ApiProperty({ description: "Amount disbursed (after fees)", example: 0 })
  disbursedAmount: number;

  @ApiProperty({ description: "Total remaining payable (principal + interest)", example: 12000 })
  totalPayable: number;

  @ApiProperty({ description: "Annual interest rate (percentage)" })
  interestRate: number;

  @ApiProperty({ description: "Term in months" })
  termInMonths: number;

  @ApiProperty({ enum: LoanStatus })
  status: LoanStatus;

  @ApiPropertyOptional({ description: "Admin id who approved/rejected", example: null })
  approvedById: number | null;

  @ApiPropertyOptional({ description: "Disbursement date", type: String, format: "date-time" })
  disbursementDate: Date | null;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt: Date;

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt: Date;
}

export class LoanResBodyDTO extends ResBodyDTO<LoanDTO> {
  @ApiProperty({ type: LoanDTO })
  data: LoanDTO;
}

export class PaginatedLoanResBodyDTO extends PaginatedResBodyDTO<LoanDTO> {
  @ApiProperty({ type: LoanDTO, isArray: true })
  data: LoanDTO[];
}
