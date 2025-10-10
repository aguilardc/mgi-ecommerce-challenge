import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { getRabbitMQConfig } from '@infrastructure/config/rabbitmq.config';
import { getAppConfig } from '@shared/config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const appConfig = getAppConfig();

  // Crear aplicación híbrida (HTTP + RabbitMQ)
  const app = await NestFactory.create(AppModule);

  // Configurar RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>(getRabbitMQConfig());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Iniciar todos los microservicios
  await app.startAllMicroservices();
  logger.log('RabbitMQ microservice started');

  // Iniciar servidor HTTP
  await app.listen(appConfig.port);
  logger.log(`HTTP server running on port ${appConfig.port}`);
  logger.log(`Service: ${appConfig.serviceName}`);
  logger.log(`Environment: ${appConfig.nodeEnv}`);
}

bootstrap();
