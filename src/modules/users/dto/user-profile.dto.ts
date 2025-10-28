import { UserSessionDTO } from "@/modules/sessions/dto/session.dto";
import { UserDTO } from "./user.dto";
import { ApiProperty, OmitType } from "@nestjs/swagger";

export class UserProfileDTO {
  @ApiProperty({ type: OmitType(UserDTO, ["sessions"] as const) })
  user: Omit<UserDTO, "sessions">;

  @ApiProperty({ type: UserSessionDTO, isArray: true })
  activeSessions?: UserSessionDTO[];
}
