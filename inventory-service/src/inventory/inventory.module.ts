import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';

// Domain
import { Inventory } from '@domain/entities/inventory.entity';
import { InventoryLog } from '@domain/entities/inventory-log.entity';

// Application - Use Cases
import { ReserveStockUseCase } from '@application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from '@application/use-cases/release-stock.use-case';
import { CheckAvailabilityUseCase } from '@application/use-cases/check-availability.use-case';

// Application - Ports
import { INVENTORY_REPOSITORY } from '@application/ports/out/inventory.repository.interface';
import { EVENT_PUBLISHER } from '@application/ports/out/event.publisher.interface';

// Infrastructure - Adapters
import { InventoryController } from '@infrastructure/adapters/in/http/inventory.controller';
import { InventoryEventListener } from '@infrastructure/adapters/in/messaging/inventory-event.listener';
import { InventoryPessimisticRepository } from '@infrastructure/adapters/out/persistence/inventory-pessimistic.repository';
import { InventoryOptimisticRepository } from '@infrastructure/adapters/out/persistence/inventory-optimistic.repository';
import { InventoryAppLevelRepository } from '@infrastructure/adapters/out/persistence/inventory-app-level.repository';
import { RabbitMQEventPublisher } from '@infrastructure/adapters/out/messaging/rabbitmq-event.publisher';
import { LockingStrategy } from '@domain/enums/locking-strategy.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Inventory, InventoryLog]),
    ClientsModule.registerAsync([
      {
        name: 'INVENTORY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): RmqOptions => {
          const rabbitUrl: string =
            configService.get<string>('RABBITMQ_URL') ?? 'amqp://guest:guest@localhost:5672';
          const queueName: string =
            configService.get<string>('RABBITMQ_QUEUE_INVENTORY') ?? 'inventory_queue';

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUrl],
              queue: queueName,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [InventoryController, InventoryEventListener],
  providers: [
    // Use Cases
    ReserveStockUseCase,
    ReleaseStockUseCase,
    CheckAvailabilityUseCase,

    {
      provide: INVENTORY_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        pessimisticRepo: InventoryPessimisticRepository,
        optimisticRepo: InventoryOptimisticRepository,
        appLevelRepo: InventoryAppLevelRepository,
      ) => {
        const strategy = configService.get<string>('LOCKING_STRATEGY', 'PESSIMISTIC');

        switch (strategy) {
          case LockingStrategy.PESSIMISTIC:
            return pessimisticRepo;
          case LockingStrategy.OPTIMISTIC:
            return optimisticRepo;
          case LockingStrategy.APPLICATION:
            return appLevelRepo;
          default:
            return pessimisticRepo;
        }
      },
      inject: [
        ConfigService,
        InventoryPessimisticRepository,
        InventoryOptimisticRepository,
        InventoryAppLevelRepository,
      ],
    },

    // Repository Implementations
    InventoryPessimisticRepository,
    InventoryOptimisticRepository,
    InventoryAppLevelRepository,

    // Event Publisher
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitMQEventPublisher,
    },
  ],
  exports: [ReserveStockUseCase, ReleaseStockUseCase, CheckAvailabilityUseCase],
})
export class InventoryModule {}
