import helmet from "helmet";
import * as morgan from "morgan";
import * as packageInfo from "../package.json";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConsoleLogger, HttpStatus, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_PORT } from "@/config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: new ConsoleLogger({
      logLevels: ["log", "fatal", "error", "warn", "debug", "verbose"],
      colors: true,
      timestamp: true,
    }),
  });

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(helmet());
  app.use(morgan("dev"));

  const config = new DocumentBuilder()
    .setTitle("ESaving API")
    .setDescription("ESaving API documentation. Digital Credit & Savings Platform")
    .setVersion(packageInfo.version)
    .addBearerAuth()
    .addServer("/", "Server URL")
    .addGlobalResponse(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Server error",
        example: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Internal server error",
          message: "Internal server error",
        },
      },
      {
        status: HttpStatus.UNAUTHORIZED,
        description: "Unauthorized",
        example: {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: "Unauthorized",
          message: "Unauthorized",
        },
      },
      {
        status: HttpStatus.FORBIDDEN,
        description: "Forbidden",
        example: {
          statusCode: HttpStatus.FORBIDDEN,
          error: "Forbidden",
          message: "Forbidden",
        },
      },
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/documentation", app, documentFactory, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: "/api/json",
    yamlDocumentUrl: "/api/yaml",
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>("PORT", DEFAULT_PORT);

  await app.listen(PORT, () => {
    Logger.log(`HTTP Server is running on http://localhost:${PORT}`, "Bootstrap");
    Logger.log(`Swagger JSON is running on http://localhost:${PORT}/api/json`, "Bootstrap");
    Logger.log(`Swagger YAML is running on http://localhost:${PORT}/api/yaml`, "Bootstrap");
    Logger.log(`Swagger UI is running on http://localhost:${PORT}/api/documentation`, "Bootstrap");
  });
}

void bootstrap();
