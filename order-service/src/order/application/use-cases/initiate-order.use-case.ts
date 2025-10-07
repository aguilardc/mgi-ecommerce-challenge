import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IOrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '@domain/ports/out/order-repository.port';
import { IEventPublisherPort, EVENT_PUBLISHER_PORT } from '@domain/ports/out/event-publisher.port';
import { OrderDomainService } from '@domain/services/order-domain.service';
import { OrderModel } from '@domain/models/order.model';
import { OrderInitiatedEvent } from '@shared/events/order-events';
import { TrackingEvent } from '@shared/events/tracking-events';

@Injectable()
export class InitiateOrderUseCase {
  private readonly logger = new Logger(InitiateOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,

    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IEventPublisherPort,

    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(command: {
    userId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<OrderModel> {
    this.logger.log(`Initiating order for user: ${command.userId}`);

    // 1. Crear orden en estado PENDING (sin precios aún)
    const order = this.orderDomainService.createOrder(
      command.userId,
      command.items.map((item) => ({
        productId: item.productId,
        productName: 'TBD', // Se actualizará cuando Inventory responda
        quantity: item.quantity,
        unitPrice: 0, // Se actualizará cuando Inventory responda
      })),
    );

    // 2. Guardar orden en estado PENDING
    const savedOrder = await this.orderRepository.save(order);

    // 3. Publicar evento: ORDER_INITIATED
    const event = new OrderInitiatedEvent(
      savedOrder.id,
      savedOrder.userId,
      savedOrder.getItemsForInventory(),
    );

    this.eventPublisher.publish('order.initiated', event);

    this.logger.log(`Order initiated: ${savedOrder.id}`);

    // 4. Publicar tracking
    this.eventPublisher.publish(
      'event.log',
      new TrackingEvent(
        savedOrder.id,
        'ORDER_INITIATED',
        { userId: command.userId, items: command.items },
        'order-service',
        'Order creation initiated, waiting for stock reservation',
      ),
    );

    return savedOrder;
  }
}
