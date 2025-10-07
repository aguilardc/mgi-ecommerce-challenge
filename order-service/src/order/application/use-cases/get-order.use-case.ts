import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IOrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '@domain/ports/out/order-repository.port';
import { OrderModel } from '@domain/models/order.model';

@Injectable()
export class GetOrderUseCase {
  private readonly logger = new Logger(GetOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async getOrderById(orderId: string): Promise<OrderModel> {
    this.logger.log(`Getting order: ${orderId}`);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }
}
