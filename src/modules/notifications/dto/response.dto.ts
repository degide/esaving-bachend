import { PaginatedResBodyDTO } from "@/common/dto/response.dto";
import { NotificationDTO } from "./notification.dto";
import { ApiProperty } from "@nestjs/swagger";

export class PaginatedNotificationResBodyDTO extends PaginatedResBodyDTO<NotificationDTO> {
  @ApiProperty({ type: () => NotificationDTO, isArray: true })
  data: NotificationDTO[];
}
