import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TransactionType, TransactionStatus, Transaction } from "@/modules/prisma/prisma.models";
import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";
import { AccountDTO } from "@/modules/accounts/dto/account.dto";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class DepositWithdrawDTO {
  @ApiProperty({ description: "Account ID to deposit/withdraw", example: 1 })
  @IsNumber()
  @Min(1, { message: "Account ID must be a positive number" })
  accountId: number;

  @ApiProperty({ description: "Amount to deposit/withdraw", example: 1000 })
  @IsNumber()
  @Min(1, { message: "Amount must be a positive number" })
  amount: number;

  @ApiProperty({ description: "Description" })
  @IsString()
  @IsNotEmpty({ message: "Description must not be empty" })
  description: string;
}

export class TransactionDTO implements Transaction {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reference: string;

  @ApiProperty({ nullable: true })
  sourceAccountId: number | null;

  @ApiProperty({ nullable: true })
  loanId: number | null;

  @ApiProperty({ nullable: true })
  destinationAccountId: number | null;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: AccountDTO })
  sourceAccount?: AccountDTO;

  @ApiPropertyOptional({ type: AccountDTO })
  destinationAccount?: AccountDTO;
}

export class TransactionResBodyDTO extends ResBodyDTO<TransactionDTO> {
  @ApiProperty({ type: TransactionDTO })
  data: TransactionDTO;
}

export class PaginatedTransactionResBodyDTO extends PaginatedResBodyDTO<TransactionDTO> {
  @ApiProperty({ type: () => TransactionDTO, isArray: true })
  data: TransactionDTO[];
}
