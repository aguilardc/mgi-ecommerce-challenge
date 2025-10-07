import { OrderItemModel } from './order-item.model';
import { OrderStatusVO } from '../value-objects/order-status.vo';

export class OrderModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly status: OrderStatusVO,
    public readonly items: OrderItemModel[],
    public readonly totalAmount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.items || this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const calculatedTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Tolerancia de 0.01 para problemas de precisión decimal
    const diff = Math.abs(this.totalAmount - calculatedTotal);

    if (diff > 0.01) {
      throw new Error(
        `Total amount must equal sum of item subtotals. Expected: ${calculatedTotal}, Got: ${this.totalAmount}`,
      );
    }
  }

  static create(id: string, userId: string, items: OrderItemModel[]): OrderModel {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();

    return new OrderModel(id, userId, OrderStatusVO.pending(), items, totalAmount, now, now);
  }

  confirm(): OrderModel {
    if (!this.status.isPending()) {
      throw new Error('Only pending orders can be confirmed');
    }

    return new OrderModel(
      this.id,
      this.userId,
      OrderStatusVO.confirmed(),
      this.items,
      this.totalAmount,
      this.createdAt,
      new Date(),
    );
  }

  fail(): OrderModel {
    if (!this.status.isPending()) {
      throw new Error('Only pending orders can fail');
    }

    return new OrderModel(
      this.id,
      this.userId,
      OrderStatusVO.failed(),
      this.items,
      this.totalAmount,
      this.createdAt,
      new Date(),
    );
  }

  cancel(): OrderModel {
    if (!this.status.canBeCancelled()) {
      throw new Error(`Cannot cancel order with status: ${this.status.getValue()}`);
    }

    return new OrderModel(
      this.id,
      this.userId,
      OrderStatusVO.cancelled(),
      this.items,
      this.totalAmount,
      this.createdAt,
      new Date(),
    );
  }

  getItemsForInventory(): Array<{ productId: string; quantity: number }> {
    return this.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  }
}
