import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";
import { AccountDTO } from "./account.dto";
import { ApiProperty } from "@nestjs/swagger";

export class AccountResBodyDTO extends ResBodyDTO<AccountDTO> {
  @ApiProperty({ type: () => AccountDTO })
  data: AccountDTO;
}

export class UserAccountsResBodyDTO extends ResBodyDTO<AccountDTO[]> {
  @ApiProperty({ type: () => AccountDTO, isArray: true })
  data: AccountDTO[];
}

export class PaginatedAccountResBodyDTO extends PaginatedResBodyDTO<AccountDTO> {
  @ApiProperty({
    type: () => AccountDTO,
    isArray: true,
  })
  data: AccountDTO[];
}
