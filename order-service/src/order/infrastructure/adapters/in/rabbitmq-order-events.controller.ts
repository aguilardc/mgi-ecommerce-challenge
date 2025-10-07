import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ConfirmOrderUseCase } from '@application/use-cases/confirm-order.use-case';
import { FailOrderUseCase } from '@application/use-cases/fail-order.use-case';
import { StockReservedEvent, StockReservationFailedEvent } from '@shared/events/inventory-events';

@Controller()
export class RabbitMQOrderEventsController {
  private readonly logger = new Logger(RabbitMQOrderEventsController.name);

  constructor(
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly failOrderUseCase: FailOrderUseCase,
  ) {}

  /**
   * Escucha: stock.reserved (publicado por Inventory Service)
   * Reacciona: Confirma la orden
   */
  @EventPattern('stock.reserved')
  async onStockReserved(@Payload() event: StockReservedEvent, @Ctx() context: RmqContext) {
    this.logger.log(`Event received: stock.reserved for order ${event.orderId}`);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.confirmOrderUseCase.execute(event.orderId, event.items);

      channel.ack(originalMsg);
      this.logger.log(`Order ${event.orderId} confirmed successfully`);
    } catch (error) {
      this.logger.error(`Failed to confirm order ${event.orderId}:`, error.message);

      // Intentar marcar orden como fallida
      try {
        await this.failOrderUseCase.execute(event.orderId, error.message, 'order_confirmation');
      } catch (failError) {
        this.logger.error('Failed to mark order as failed:', failError.message);
      }

      channel.ack(originalMsg);
    }
  }

  /**
   * Escucha: stock.reservation.failed (publicado por Inventory Service)
   * Reacciona: Marca orden como fallida
   */
  @EventPattern('stock.reservation.failed')
  async onStockReservationFailed(
    @Payload() event: StockReservationFailedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Event received: stock.reservation.failed for order ${event.orderId}`);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.failOrderUseCase.execute(
        event.orderId,
        `Insufficient stock for product ${event.failedProductId}: ${event.reason}`,
        'stock_reservation',
      );

      channel.ack(originalMsg);
      this.logger.log(`Order ${event.orderId} marked as failed`);
    } catch (error) {
      this.logger.error(`Failed to mark order as failed:`, error.message);
      channel.ack(originalMsg);
    }
  }
}
