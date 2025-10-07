import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@shared/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE_INVENTORY || 'inventory_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('E-commerce Inventory Management with Hexagonal Architecture')
    .setVersion('1.0')
    .addTag('inventory')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar microservicio
  await app.startAllMicroservices();
  logger.log('Microservice RabbitMQ started');

  // Iniciar servidor HTTP
  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`🚀 Inventory Service running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔒 Locking Strategy: ${process.env.LOCKING_STRATEGY || 'PESSIMISTIC'}`);
}

bootstrap();
