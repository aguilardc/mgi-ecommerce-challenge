import { RmqOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (url: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [url],
    queue: 'orders_queue',
    queueOptions: {
      durable: true,
    },
    noAck: true,
    prefetchCount: 1,
  },
});
