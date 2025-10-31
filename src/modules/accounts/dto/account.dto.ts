import { Decimal } from "@/modules/prisma/client/internal/prismaNamespace";
import { Account, AccountType, GeneralStatus } from "@/modules/prisma/prisma.models";
import { UserDTO } from "@/modules/users/dto/user.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AccountDTO implements Account {
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty({ nullable: true })
  userId: number | null;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: AccountType, default: AccountType.SAVINGS })
  accountType: AccountType;

  @ApiProperty({ enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => UserDTO })
  user?: UserDTO;
}
