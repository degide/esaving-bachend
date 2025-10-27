import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { JwtPayload } from "@/common/types";
import { UserHasRoles, UserHasAnyRole } from "@/common/decorators/auth.decorator";
import { ConfigService } from "@nestjs/config";

/**
 * Guard to check if a user has ALL of the specified roles
 */
@Injectable()
export class UserHasRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const requiredRoles = this.reflector.get(UserHasRoles, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException("User is not logged in");
    }

    try {
      // Verify JWT token
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: this.configService.get<string>("JWT_SECRET", "default"),
      });

      // Check if the user has ALL required roles
      const hasAllRoles = requiredRoles.every((role) => role === payload.role);

      if (!hasAllRoles) {
        throw new UnauthorizedException("User lacks required roles");
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token or insufficient user roles");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request?.headers?.authorization) {
      return undefined;
    }
    const [type, token]: string[] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

/**
 * Guard to check if a user has ANY of the specified roles
 */
@Injectable()
export class UserHasAnyRoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const requiredRoles = this.reflector.get(UserHasAnyRole, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException("User is not logged in");
    }

    try {
      // Verify JWT token
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: this.configService.get<string>("JWT_SECRET", "default"),
      });

      // Check if the user has ANY of the required roles
      const hasAnyRoles = requiredRoles.some((role) => role === payload.role);

      if (!hasAnyRoles) {
        throw new UnauthorizedException("User lacks required roles");
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token or insufficient user roles");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request?.headers?.authorization) {
      return undefined;
    }
    const [type, token]: string[] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
