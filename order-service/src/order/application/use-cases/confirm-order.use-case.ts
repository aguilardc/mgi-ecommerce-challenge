import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IOrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '@domain/ports/out/order-repository.port';
import { IEventPublisherPort, EVENT_PUBLISHER_PORT } from '@domain/ports/out/event-publisher.port';
import { OrderModel } from '@domain/models/order.model';
import { OrderItemModel } from '@domain/models/order-item.model';
import { OrderConfirmedEvent, OrderCreatedEvent } from '@shared/events/order-events';
import { TrackingEvent } from '@shared/events/tracking-events';

@Injectable()
export class ConfirmOrderUseCase {
  private readonly logger = new Logger(ConfirmOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,

    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(
    orderId: string,
    reservedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
  ): Promise<OrderModel> {
    this.logger.log(`Confirming order: ${orderId}`);

    // 1. Obtener orden
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Actualizar items con precios reales de Inventory
    const updatedItems = order.items.map((item) => {
      const reservedItem = reservedItems.find((ri) => ri.productId === item.productId);

      if (!reservedItem) {
        throw new Error(`Product ${item.productId} not found in reservation`);
      }

      return OrderItemModel.create(
        item.id,
        item.orderId,
        item.productId,
        reservedItem.productName,
        reservedItem.quantity,
        reservedItem.unitPrice,
      );
    });

    // 3. Crear orden actualizada y confirmarla
    const updatedOrder = new OrderModel(
      order.id,
      order.userId,
      order.status,
      updatedItems,
      updatedItems.reduce((sum, item) => sum + item.subtotal, 0),
      order.createdAt,
      new Date(),
    );

    const confirmedOrder = updatedOrder.confirm();

    // 4. Guardar orden confirmada
    const savedOrder = await this.orderRepository.update(confirmedOrder);

    // 5. Publicar evento: ORDER_CREATED
    this.eventPublisher.publish(
      'order.created',
      new OrderCreatedEvent(
        savedOrder.id,
        savedOrder.userId,
        savedOrder.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
        savedOrder.totalAmount,
      ),
    );

    // 6. Publicar evento: ORDER_CONFIRMED
    this.eventPublisher.publish(
      'order.confirmed',
      new OrderConfirmedEvent(savedOrder.id, savedOrder.status.getValue()),
    );

    // 7. Tracking
    this.eventPublisher.publish(
      'event.log',
      new TrackingEvent(
        savedOrder.id,
        'ORDER_CONFIRMED',
        { status: 'CONFIRMED' },
        'order-service',
        'Order confirmed successfully',
      ),
    );

    this.logger.log(`Order confirmed: ${orderId}`);

    return savedOrder;
  }
}
