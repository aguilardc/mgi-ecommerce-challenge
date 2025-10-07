export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatusVO {
  private constructor(private readonly value: OrderStatus) {}

  static create(status: string): OrderStatusVO {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    return new OrderStatusVO(status as OrderStatus);
  }

  static pending(): OrderStatusVO {
    return new OrderStatusVO(OrderStatus.PENDING);
  }

  static confirmed(): OrderStatusVO {
    return new OrderStatusVO(OrderStatus.CONFIRMED);
  }

  static failed(): OrderStatusVO {
    return new OrderStatusVO(OrderStatus.FAILED);
  }

  static cancelled(): OrderStatusVO {
    return new OrderStatusVO(OrderStatus.CANCELLED);
  }

  getValue(): OrderStatus {
    return this.value;
  }

  isPending(): boolean {
    return this.value === OrderStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this.value === OrderStatus.CONFIRMED;
  }

  isFailed(): boolean {
    return this.value === OrderStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.value === OrderStatus.CANCELLED;
  }

  canBeCancelled(): boolean {
    return this.value === OrderStatus.PENDING || this.value === OrderStatus.CONFIRMED;
  }
}