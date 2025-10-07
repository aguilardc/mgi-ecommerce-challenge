export const RABBITMQ_CONFIG = {
  EXCHANGE: 'ecommerce_events',
  QUEUES: {
    ORDER: 'order_queue',
    INVENTORY: 'inventory_queue',
    PAYMENT: 'payment_queue',
    TRACKING: 'tracking_queue',
  },
  ROUTING_KEYS: {
    ORDER_CREATED: 'order.created',
    ORDER_CONFIRMED: 'order.confirmed',
    ORDER_CANCELLED: 'order.cancelled',
    ORDER_FAILED: 'order.failed',
    INVENTORY_RESERVED: 'inventory.reserved',
    INVENTORY_RESERVE_FAILED: 'inventory.reserve.failed',
    INVENTORY_RELEASED: 'inventory.released',
    PAYMENT_PROCESSED: 'payment.processed',
    PAYMENT_FAILED: 'payment.failed',
  },
};
