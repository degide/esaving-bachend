import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class ResBodyDTO<T> {
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty()
  message: string;

  data?: T;
}

export class PaginatedResBodyDTO<T> {
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: "array" })
  data?: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class CountDTO {
  @ApiProperty()
  count: number;
}
