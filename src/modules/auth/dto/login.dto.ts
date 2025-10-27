import { ResBodyDTO } from "@/common/dto/response.dto";
import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDTO {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class LoginResBodyDataDTO {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  refreshTokenExpiry: Date;
}

export class LoginResBodyDTO implements ResBodyDTO<LoginResBodyDataDTO> {
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: LoginResBodyDataDTO;
}
