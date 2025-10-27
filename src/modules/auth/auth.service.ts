import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "@/modules/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@/common/types";
import { User } from "@/modules/prisma/prisma.models";
import { compare } from "bcryptjs";
import { LoginResBodyDataDTO } from "@/modules/auth/dto/login.dto";
import { ResBodyDTO } from "@/common/dto/response.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const res = await this.usersService.findOneByEmail(username);
    if (!res.data) return null;
    const match = await compare(password, res.data.password);
    if (match) return res.data;
    return null;
  }

  async login(user?: User): Promise<ResBodyDTO<LoginResBodyDataDTO>> {
    if (!user) throw new UnauthorizedException("Unauthorized");
    const result = await this.usersService.findById(user.id);
    if (!result.data) throw new UnauthorizedException("Unauthorized");
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      sub: user.id,
      role: result.data.role,
    };
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
        refreshToken: "",
        refreshTokenExpiry: new Date(Date.now()),
      },
    };
  }
}
