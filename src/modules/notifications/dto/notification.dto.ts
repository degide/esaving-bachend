import { ApiProperty } from "@nestjs/swagger";
import { NotificationType, Notification } from "@/modules/prisma/prisma.models";

export class NotificationDTO implements Notification {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
