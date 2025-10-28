import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Module({
  imports: [],
  providers: [PrismaService, AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
