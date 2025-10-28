import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";
import { HttpStatus } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { User, GeneralStatus, UserRole, Gender, Account } from "@/modules/prisma/prisma.models";
import { UserSessionDTO } from "@/modules/sessions/dto/session.dto";

export class UserDTO implements User {
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  middleName: string | null;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ type: "string", format: "email" })
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @ApiProperty({ type: "number" })
  creditScore: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: UserSessionDTO, isArray: true })
  sessions?: UserSessionDTO[];

  @ApiPropertyOptional()
  accounts?: object;
}

export class CreateUserDTO {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @ApiPropertyOptional({ type: "string", nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  lastName: string;

  @ApiProperty({ type: "string", format: "email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ maxLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ type: "string", enum: Gender })
  gender: Gender | null;

  @ApiPropertyOptional({ type: "string", enum: UserRole })
  role?: UserRole;
}

export class ChangeUserRoleDTO {
  @ApiProperty({ type: "number" })
  userId: number;

  @ApiProperty({ type: "string", enum: UserRole })
  role: UserRole;
}

export class UserResBodyDTO extends ResBodyDTO<Omit<UserDTO, "password">> {
  @ApiProperty({ type: OmitType(UserDTO, ["password"]) })
  data: Omit<UserDTO, "password">;
}

export class UserCreatedResponseDTO extends UserResBodyDTO {
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.CREATED })
  statusCode: HttpStatus;
}

export class PaginatedUserResBodyDTO extends PaginatedResBodyDTO<Omit<UserDTO, "password">> {
  @ApiProperty({
    type: () => OmitType(UserDTO, ["password"]),
    isArray: true,
  })
  data: Omit<UserDTO, "password">[];
}
