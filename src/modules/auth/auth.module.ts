import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "@/modules/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtStrategy } from "@/modules/auth/strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { LocalStrategy } from "@/modules/auth/strategies/local.strategy";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "default"),
        signOptions: {
          expiresIn: `${configService.get<number>("JWT_EXPIRY_MINUTES", 120)} Min`,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [PrismaService, AuthService, LocalStrategy, JwtStrategy, JwtService],
  exports: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
