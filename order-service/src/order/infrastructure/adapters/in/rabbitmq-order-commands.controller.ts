import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InitiateOrderUseCase } from '@application/use-cases/initiate-order.use-case';
import { GetOrderUseCase } from '@application/use-cases/get-order.use-case';
import { CancelOrderUseCase } from '@application/use-cases/cancel-order.use-case';
import { CreateOrderDto } from '@application/dto/create-order.dto';

@Controller()
export class RabbitMQOrderCommandsController {
  private readonly logger = new Logger(RabbitMQOrderCommandsController.name);

  constructor(
    private readonly initiateOrderUseCase: InitiateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @MessagePattern('order.create')
  async createOrder(@Payload() data: CreateOrderDto) {
    this.logger.log('Received: order.create');

    try {
      // Solo INICIA la orden (publica evento)
      const order = await this.initiateOrderUseCase.execute({
        userId: data.userId,
        items: data.items,
      });

      // Respuesta inmediata al API Gateway
      return {
        success: true,
        data: {
          orderId: order.id,
          status: order.status.getValue(),
          message: 'Order initiated, processing...',
        },
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Error initiating order:', error.message);

      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }

  @MessagePattern('order.get')
  async getOrder(@Payload() data: { orderId: string }) {
    this.logger.log(`Received: order.get - ${data.orderId}`);

    try {
      const order = await this.getOrderUseCase.getOrderById(data.orderId);

      return {
        success: true,
        data: {
          orderId: order.id,
          userId: order.userId,
          status: order.status.getValue(),
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          totalAmount: order.totalAmount,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        },
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Error getting order:', error.message);

      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }

  @MessagePattern('order.cancel')
  async cancelOrder(@Payload() data: { orderId: string }) {
    this.logger.log(`Received: order.cancel - ${data.orderId}`);

    try {
      const order = await this.cancelOrderUseCase.cancelOrder(data.orderId);

      return {
        success: true,
        data: {
          orderId: order.id,
          status: order.status.getValue(),
        },
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Error cancelling order:', error.message);

      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }
}
