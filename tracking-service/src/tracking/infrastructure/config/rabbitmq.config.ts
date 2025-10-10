import { Transport, RmqOptions } from '@nestjs/microservices';

export const getRabbitMQConfig = (): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'tracking_queue',
    queueOptions: {
      durable: true,
    },
    prefetchCount: 10,
    noAck: false,
  },
});