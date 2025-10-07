export class OrderInitiatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>,
    public readonly totalAmount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: string,
    public readonly status: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderFailedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly failedStep: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
