import { OrderModel } from '../../models/order.model';

export interface CreateOrderCommand {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface IOrderUseCasesPort {
  createOrder(command: CreateOrderCommand): Promise<OrderModel>;
  getOrderById(orderId: string): Promise<OrderModel>;
  cancelOrder(orderId: string): Promise<OrderModel>;
}

export const ORDER_USE_CASES_PORT = Symbol('ORDER_USE_CASES_PORT');
