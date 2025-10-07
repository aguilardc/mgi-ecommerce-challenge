import { Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (url: string) => ({
  transport: Transport.RMQ,
  options: {
    urls: [url],
    queue: 'api_gateway_queue',
    queueOptions: {
      durable: false,
    },
    noAck: false,
    prefetchCount: 1,
  },
});
