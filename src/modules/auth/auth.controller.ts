import { Controller, Post, UseGuards, Req, Body, HttpStatus, HttpCode, Res, Put, Headers } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { LocalAuthGuard } from "@/common/guards/local-auth.guard";
import { User } from "@/modules/prisma/prisma.models";
import { LoginDTO, LoginResBodyDTO } from "@/modules/auth/dto/login.dto";
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller({
  path: "api/auth",
  version: "1",
})
@ApiBearerAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: "User login",
    description: "Authenticate user and return JWT token.",
  })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Success",
    type: LoginResBodyDTO,
  })
  async login(@Req() req: Request, @Res() res: Response, @Body() body: LoginDTO) {
    const result = await this.authService.login(req.user as User);
    return res.status(result.statusCode).json(result);
  }

  @Put("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh the JWT access token",
    description: "Refresh the JWT access token",
  })
  @ApiHeader({
    name: "Refresh-Token",
  })
  @ApiOkResponse({
    description: "Success",
    type: LoginResBodyDTO,
  })
  async refreshAccessToken(@Req() req: Request, @Res() res: Response, @Headers("Refresh-Token") refreshToken: string) {
    const result = await this.authService.refreshAccessToken(refreshToken);
    return res.status(result.statusCode).json(result);
  }

  @ApiOperation({
    summary: "User logout",
    description: "Logout user and invalidate the session.",
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(@Req() req: Request) {
    await this.authService.logout((req.user as User).id);
    req.logout(() => {});
  }
}
