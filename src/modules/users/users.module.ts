import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsModule } from "@/modules/notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [PrismaService, UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
