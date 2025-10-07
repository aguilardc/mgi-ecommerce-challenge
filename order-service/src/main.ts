import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { getRabbitMQConfig } from '@infrastructure/config/rabbitmq.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Configurar microservice RabbitMQ
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  app.connectMicroservice<RmqOptions>(getRabbitMQConfig(rabbitmqUrl));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Iniciar microservices
  await app.startAllMicroservices();
  logger.log('✓ Order Service microservice started (Event-Driven)');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Order Service running on port ${port}`);
  logger.log(`📡 RabbitMQ: ${rabbitmqUrl}`);
  logger.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  logger.log(`🏗️  Architecture: Event-Driven Choreography`);
}

bootstrap();
