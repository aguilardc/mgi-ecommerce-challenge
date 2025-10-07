import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { OrderEntity } from '@infrastructure/adapters/out/persistence/entities/order.entity';
import { OrderItemEntity } from '@infrastructure/adapters/out/persistence/entities/order-item.entity';

// Controllers (Inbound Adapters)
import { RabbitMQOrderCommandsController } from '@infrastructure/adapters/in/rabbitmq-order-commands.controller';
import { RabbitMQOrderEventsController } from '@infrastructure/adapters/in/rabbitmq-order-events.controller';

// Use Cases
import { InitiateOrderUseCase } from '@application/use-cases/initiate-order.use-case';
import { ConfirmOrderUseCase } from '@application/use-cases/confirm-order.use-case';
import { FailOrderUseCase } from '@application/use-cases/fail-order.use-case';
import { GetOrderUseCase } from '@application/use-cases/get-order.use-case';
import { CancelOrderUseCase } from '@application/use-cases/cancel-order.use-case';

// Domain Services
import { OrderDomainService } from '@domain/services/order-domain.service';

// Repositories
import { TypeORMOrderRepository } from '@infrastructure/adapters/out/persistence/typeorm-order.repository';
import { ORDER_REPOSITORY_PORT } from '@domain/ports/out/order-repository.port';

// Event Publisher
import { RabbitMQEventPublisherAdapter } from '@infrastructure/adapters/out/messaging/rabbitmq-event-publisher.adapter';
import { EVENT_PUBLISHER_PORT } from '@domain/ports/out/event-publisher.port';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])],
  controllers: [RabbitMQOrderCommandsController, RabbitMQOrderEventsController],
  providers: [
    // Use Cases
    InitiateOrderUseCase,
    ConfirmOrderUseCase,
    FailOrderUseCase,
    GetOrderUseCase,
    CancelOrderUseCase,

    // Domain Services
    OrderDomainService,

    // Repository Port Implementation
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: TypeORMOrderRepository,
    },

    // Event Publisher Port Implementation
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: RabbitMQEventPublisherAdapter,
    },
  ],
})
export class OrderModule {}
