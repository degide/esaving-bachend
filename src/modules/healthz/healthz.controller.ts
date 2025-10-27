import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller({
  path: "api/healthz",
  version: "1",
})
@ApiTags("Health Check")
export class HealthzController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Health check endpoint",
    description: "This endpoint is used to check the health of the API.",
  })
  @ApiOkResponse({
    description: "The API is healthy.",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", default: HttpStatus.OK },
        message: { type: "string", default: "Server is up and running" },
      },
    },
  })
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: "Server is up and running",
    };
  }
}
