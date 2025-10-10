import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { LogEventUseCase } from '@application/use-cases/log-event.use-case';

@Controller()
export class RabbitMQTrackingEventsController {
  private readonly logger = new Logger(RabbitMQTrackingEventsController.name);

  constructor(private readonly logEventUseCase: LogEventUseCase) {}

  @EventPattern('order.initiated')
  async handleOrderInitiated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.initiated event for order: ${data.orderId}`);
    await this.handleEvent('order.initiated', 'order-service', data);
    this.ackMessage(context);
  }

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.created event for order: ${data.orderId}`);
    await this.handleEvent('order.created', 'order-service', data);
    this.ackMessage(context);
  }

  @EventPattern('order.confirmed')
  async handleOrderConfirmed(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.confirmed event for order: ${data.orderId}`);
    await this.handleEvent('order.confirmed', 'order-service', data);
    this.ackMessage(context);
  }

  @EventPattern('order.failed')
  async handleOrderFailed(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.failed event for order: ${data.orderId}`);
    await this.handleEvent('order.failed', 'order-service', data);
    this.ackMessage(context);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received order.cancelled event for order: ${data.orderId}`);
    await this.handleEvent('order.cancelled', 'order-service', data);
    this.ackMessage(context);
  }

  @EventPattern('stock.reserved')
  async handleStockReserved(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received stock.reserved event for order: ${data.orderId}`);
    await this.handleEvent('stock.reserved', 'inventory-service', data);
    this.ackMessage(context);
  }

  @EventPattern('stock.reservation.failed')
  async handleStockReservationFailed(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received stock.reservation.failed event for order: ${data.orderId}`);
    await this.handleEvent('stock.reservation.failed', 'inventory-service', data);
    this.ackMessage(context);
  }

  @EventPattern('stock.released')
  async handleStockReleased(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Received stock.released event for order: ${data.orderId}`);
    await this.handleEvent('stock.released', 'inventory-service', data);
    this.ackMessage(context);
  }

  private async handleEvent(eventType: string, eventSource: string, data: any) {
    try {
      await this.logEventUseCase.execute({
        eventType,
        eventSource,
        orderId: data.orderId,
        payload: data,
        metadata: {
          receivedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Error logging event ${eventType}:`, error);
      throw error;
    }
  }

  private ackMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
