export class StockReservedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservationId: string,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockReservationFailedEvent {
  constructor(
    public readonly orderId: string,
    public readonly failedProductId: string,
    public readonly reason: string,
    public readonly availableStock: number,
    public readonly requestedQuantity: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockReleasedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservationId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
