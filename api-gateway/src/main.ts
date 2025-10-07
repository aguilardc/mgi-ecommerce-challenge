import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port');
  const rabbitmqUrl = configService.get<string>('rabbitmq.url');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  await app.listen(port);

  logger.log(`🚀 API Gateway running on http://localhost:${port}/api`);
  logger.log(`📡 RabbitMQ: ${rabbitmqUrl}`);
  logger.log(`🏗️  Architecture: N-Tier (Layered)`);
}

bootstrap();