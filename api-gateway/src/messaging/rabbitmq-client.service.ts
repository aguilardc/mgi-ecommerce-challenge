import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class RabbitMQClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQClientService.name);
  private client: ClientProxy;
  private readonly timeoutMs: number;

  constructor(private configService: ConfigService) {
    const rabbitmqUrl = this.configService.get<string>('rabbitmq.url');

    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not defined in configuration');
    }

    this.timeoutMs =
      this.configService.get<number>('rabbitmq.timeout') ?? 30000;

    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue:
          this.configService.get<string>('rabbitmq.queue') ?? 'orders_queue',
        queueOptions: {
          durable: true,
        },
        noAck: true,
        prefetchCount: 1,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('✓ Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('✗ Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('RabbitMQ connection closed');
  }

  async send<T>(pattern: string, data: any): Promise<T | null> {
    try {
      return await lastValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(this.timeoutMs),
          catchError((error) => {
            this.logger.error(
              `Error sending message to pattern ${pattern}:`,
              error,
            );
            return of(null);
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to send message to ${pattern}:`, error);
      return null;
    }
  }

  async emit(pattern: string, data: any): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit(pattern, data).pipe(
          timeout(this.timeoutMs),
          catchError((error) => {
            this.logger.error(
              `Error emitting event to pattern ${pattern}:`,
              error,
            );
            return of(null);
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to emit event to ${pattern}:`, error);
    }
  }
}
