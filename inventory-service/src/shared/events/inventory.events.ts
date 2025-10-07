export interface InventoryReservedEvent {
  orderId: string;
  productId: string;
  quantity: number;
  lockingStrategy?: string;
  timestamp: string;
}

export interface InventoryReserveFailedEvent {
  orderId: string;
  productId: string;
  quantity: number;
  reason: string;
  availableQuantity: number;
  timestamp: string;
}

export interface InventoryReleasedEvent {
  orderId: string;
  productId: string;
  quantity: number;
  timestamp: string;
}
