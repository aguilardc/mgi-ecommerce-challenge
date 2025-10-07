import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IOrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '@domain/ports/out/order-repository.port';
import { IEventPublisherPort, EVENT_PUBLISHER_PORT } from '@domain/ports/out/event-publisher.port';
import { OrderModel } from '@domain/models/order.model';
import { OrderFailedEvent } from '@shared/events/order-events';
import { TrackingEvent } from '@shared/events/tracking-events';

@Injectable()
export class FailOrderUseCase {
  private readonly logger = new Logger(FailOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,

    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(orderId: string, reason: string, failedStep: string): Promise<OrderModel> {
    this.logger.log(`Failing order: ${orderId} - Reason: ${reason}`);

    // 1. Obtener orden
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Marcar como fallida
    const failedOrder = order.fail();

    // 3. Guardar
    const savedOrder = await this.orderRepository.update(failedOrder);

    // 4. Publicar evento: ORDER_FAILED
    this.eventPublisher.publish(
      'order.failed',
      new OrderFailedEvent(savedOrder.id, reason, failedStep),
    );

    // 5. Tracking
    this.eventPublisher.publish(
      'event.log',
      new TrackingEvent(
        savedOrder.id,
        'ORDER_FAILED',
        { reason, failedStep },
        'order-service',
        `Order failed: ${reason}`,
      ),
    );

    this.logger.log(`Order failed: ${orderId}`);

    return savedOrder;
  }
}
