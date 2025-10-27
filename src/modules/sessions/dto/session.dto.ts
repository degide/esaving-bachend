import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";
import { HttpStatus } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { UserSession, GeneralStatus } from "@/modules/prisma/prisma.models";

export class UserSessionDTO implements UserSession {
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty({ type: "number" })
  userId: number;

  @ApiProperty({ type: "string" })
  refreshToken: string;

  @ApiProperty({ type: "string", nullable: true })
  deviceInfo: string | null;

  @ApiProperty({ type: "string", nullable: true })
  ipAddress: string | null;

  @ApiProperty({ enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @ApiProperty({ type: Date })
  expiresAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class CreateUserSessionDTO implements Omit<UserSessionDTO, "id" | "createdAt"> {
  @ApiProperty({ type: "number" })
  @IsNumber()
  userId: number;

  @ApiProperty({ type: "string" })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ type: "string", nullable: true })
  @IsString()
  @IsOptional()
  deviceInfo: string | null;

  @ApiProperty({ type: "string", nullable: true })
  @IsString()
  @IsOptional()
  ipAddress: string | null;

  @ApiProperty({ enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  @IsEnum(GeneralStatus)
  status: GeneralStatus;

  @ApiProperty({ type: Date })
  expiresAt: Date;
}

export class UserSessionResBodyDTO extends ResBodyDTO<UserSessionDTO> {
  @ApiProperty({ type: UserSessionDTO })
  data?: UserSessionDTO;
}

export class PaginatedUserSessionDTO extends PaginatedResBodyDTO<UserSessionDTO> {
  @ApiProperty({ type: [UserSessionDTO] })
  data: UserSessionDTO[];
}
