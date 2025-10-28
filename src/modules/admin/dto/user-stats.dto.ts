import { ApiProperty } from "@nestjs/swagger";

export class UserStatsDTO {
  @ApiProperty({ type: "number" })
  totalUsers: number;

  @ApiProperty({ type: "number" })
  pendingUsers: number;

  @ApiProperty({ type: "number" })
  activeUsers: number;

  @ApiProperty({ type: "number" })
  inactiveUsers: number;

  @ApiProperty({ type: "number" })
  suspendedUsers: number;
}
