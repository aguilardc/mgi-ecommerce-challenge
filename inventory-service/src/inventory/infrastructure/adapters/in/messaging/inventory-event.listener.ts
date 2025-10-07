import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ReserveStockUseCase } from '@application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from '@application/use-cases/release-stock.use-case';

@Controller()
export class InventoryEventListener {
  private readonly logger = new Logger(InventoryEventListener.name);

  constructor(
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly releaseStockUseCase: ReleaseStockUseCase,
  ) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.created event for order ${data.orderId}`);

    try {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      // Reservar stock para cada item del pedido
      for (const item of data.items) {
        await this.reserveStockUseCase.execute({
          orderId: data.orderId,
          productId: item.productId,
          quantity: item.quantity,
          lockingStrategy: data.lockingStrategy,
        });
      }

      this.logger.log(`Stock reserved successfully for order ${data.orderId}`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Failed to handle order.created: ${error.message}`, error.stack);

      // Aquí podrías implementar dead letter queue o retry logic
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, false); // No requeue
    }
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.cancelled event for order ${data.orderId}`);

    try {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      // Liberar stock reservado
      for (const item of data.items) {
        await this.releaseStockUseCase.execute({
          orderId: data.orderId,
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      this.logger.log(`Stock released successfully for cancelled order ${data.orderId}`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Failed to handle order.cancelled: ${error.message}`, error.stack);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true); // Requeue para retry
    }
  }
}
