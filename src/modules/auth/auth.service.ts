import { ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "@/modules/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@/common/types";
import { User, GeneralStatus } from "@/modules/prisma/prisma.models";
import { compare } from "bcryptjs";
import { LoginResBodyDataDTO } from "@/modules/auth/dto/login.dto";
import { ResBodyDTO } from "@/common/dto/response.dto";
import { ConfigService } from "@nestjs/config";
import { v4 as uuiv4 } from "uuid";
import { SessionsService } from "@/modules/sessions/sessions.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  async validateUser(username: string, password: string) {
    const res = await this.usersService.findOneByEmail(username);
    if (!res.data) return null;
    const match = await compare(password, res.data.password);
    if (match) return res.data;
    return null;
  }

  async login(ip: string, hosts: any, user?: User): Promise<ResBodyDTO<LoginResBodyDataDTO>> {
    if (user?.status != GeneralStatus.ACTIVE) throw new ForbiddenException("Forbidden: User is not activated");
    if (!user) throw new UnauthorizedException("Unauthorized");
    const result = await this.usersService.findById(user.id);
    if (!result.data) throw new UnauthorizedException("Unauthorized");
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      sub: user.id,
      role: result.data.role,
    };
    const refreshToken = uuiv4().replace(/-/g, "") + uuiv4().replace(/-/g, "") + uuiv4().replace(/-/g, "");
    const refreshTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    await this.sessionsService.deactivateAllUserSessions(user.id);

    await this.sessionsService.createSession({
      userId: user.id,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      status: GeneralStatus.ACTIVE,
      deviceInfo: JSON.stringify(hosts),
      ipAddress: ip,
    });

    return {
      statusCode: HttpStatus.OK,
      message: "Login successful",
      data: {
        token: this.jwtService.sign(payload, {
          algorithm: "HS256",
          issuer: "esaving",
          secret: this.configService.get<string>("JWT_SECRET", "default"),
          expiresIn: `${this.configService.get<number>("JWT_EXPIRY_MINUTES", 120)} Min`,
        }),
        refreshToken,
        refreshTokenExpiry,
      },
    };
  }

  async refreshAccessToken(ip: string, hosts: string[], refreshToken: string): Promise<ResBodyDTO<LoginResBodyDataDTO>> {
    const session = await this.sessionsService.getSessionByRefreshToken(refreshToken);
    if (session && session.expiresAt > new Date(Date.now())) {
      const result = await this.usersService.findById(session.userId);
      return await this.login(ip, hosts, result.data);
    } else {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: "Forbidden: Invalid/Expired refresh token",
      };
    }
  }

  async logout(userId: number): Promise<void> {
    await this.sessionsService.deactivateAllUserSessions(userId);
  }
}
