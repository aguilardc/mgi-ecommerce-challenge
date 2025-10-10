export enum EventType {
  ORDER_INITIATED = 'order.initiated',
  ORDER_CREATED = 'order.created',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_FAILED = 'order.failed',
  ORDER_CANCELLED = 'order.cancelled',
  STOCK_RESERVED = 'stock.reserved',
  STOCK_RESERVATION_FAILED = 'stock.reservation.failed',
  STOCK_RELEASED = 'stock.released',
}

export enum EventSource {
  ORDER_SERVICE = 'order-service',
  INVENTORY_SERVICE = 'inventory-service',
  TRACKING_SERVICE = 'tracking-service',
}

export interface TrackingEventProps {
  id?: string;
  eventType: EventType;
  eventSource: EventSource;
  orderId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: Date;
  correlationId?: string;
}

export class TrackingEvent {
  private constructor(
    public readonly id: string,
    public readonly eventType: EventType,
    public readonly eventSource: EventSource,
    public readonly orderId: string,
    public readonly payload: Record<string, any>,
    public readonly metadata: Record<string, any>,
    public readonly timestamp: Date,
    public readonly correlationId: string,
  ) {}

  static create(props: TrackingEventProps): TrackingEvent {
    return new TrackingEvent(
      props.id || crypto.randomUUID(),
      props.eventType,
      props.eventSource,
      props.orderId,
      props.payload,
      props.metadata || {},
      props.timestamp || new Date(),
      props.correlationId || props.orderId,
    );
  }

  static fromPersistence(props: Required<TrackingEventProps>): TrackingEvent {
    return new TrackingEvent(
      props.id,
      props.eventType,
      props.eventSource,
      props.orderId,
      props.payload,
      props.metadata,
      props.timestamp,
      props.correlationId,
    );
  }

  isOrderEvent(): boolean {
    return this.eventType.startsWith('order.');
  }

  isStockEvent(): boolean {
    return this.eventType.startsWith('stock.');
  }

  toJSON() {
    return {
      id: this.id,
      eventType: this.eventType,
      eventSource: this.eventSource,
      orderId: this.orderId,
      payload: this.payload,
      metadata: this.metadata,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
    };
  }
}
