import { Module, Scope } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { HealthzModule } from "@/modules/healthz/healthz.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { UsersModule } from "@/modules/users/users.module";
import { AccountsModule } from "@/modules/accounts/accounts.module";
import { LoansModule } from "@/modules/loans/loans.module";
import { AdminModule } from "@/modules/admin/admin.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { UserHasAnyRoleGuard, UserHasRolesGuard } from "@/common/guards/role.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      skipProcessEnv: false,
      envFilePath: [".env", ".env.local"],
      load: [],
    }),
    HealthzModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    LoansModule,
    AdminModule,
    NotificationsModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: UserHasRolesGuard,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_GUARD,
      useClass: UserHasAnyRoleGuard,
      scope: Scope.REQUEST,
    },
  ],
})
export class AppModule {}
