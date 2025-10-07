import { Injectable } from '@nestjs/common';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderDomainService {
  /**
   * Crea una orden con items (lógica de dominio pura)
   */
  createOrder(
    userId: string,
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
  ): OrderModel {
    const orderId = uuidv4();

    const orderItems = items.map((item) =>
      OrderItemModel.create(
        uuidv4(),
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
      ),
    );

    return OrderModel.create(orderId, userId, orderItems);
  }

  /**
   * Calcula el total de la orden
   */
  calculateTotal(items: OrderItemModel[]): number {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Valida si una orden puede ser confirmada
   */
  canConfirm(order: OrderModel): boolean {
    return order.status.isPending();
  }

  /**
   * Valida si una orden puede ser cancelada
   */
  canCancel(order: OrderModel): boolean {
    return order.status.canBeCancelled();
  }
}
