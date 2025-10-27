import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { SessionsController } from "./sessions.controller";

@Module({
  providers: [PrismaService, SessionsService],
  exports: [SessionsService],
  controllers: [SessionsController],
})
export class SessionsModule {}
