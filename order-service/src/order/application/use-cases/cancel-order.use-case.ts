import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IOrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '@domain/ports/out/order-repository.port';
import { IEventPublisherPort, EVENT_PUBLISHER_PORT } from '@domain/ports/out/event-publisher.port';
import { OrderModel } from '@domain/models/order.model';
import { OrderCancelledEvent } from '@shared/events/order-events';
import { TrackingEvent } from '@shared/events/tracking-events';

@Injectable()
export class CancelOrderUseCase {
  private readonly logger = new Logger(CancelOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,

    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async cancelOrder(orderId: string, reason: string = 'User cancellation'): Promise<OrderModel> {
    this.logger.log(`Cancelling order: ${orderId}`);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Cancelar orden
    const cancelledOrder = order.cancel();

    // Guardar
    const savedOrder = await this.orderRepository.update(cancelledOrder);

    // Publicar evento: ORDER_CANCELLED
    this.eventPublisher.publish('order.cancelled', new OrderCancelledEvent(savedOrder.id, reason));

    // Tracking
    this.eventPublisher.publish(
      'event.log',
      new TrackingEvent(
        savedOrder.id,
        'ORDER_CANCELLED',
        { reason },
        'order-service',
        `Order cancelled: ${reason}`,
      ),
    );

    this.logger.log(`Order cancelled: ${orderId}`);

    return savedOrder;
  }
}
