export default () => ({
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5433', 10),
    USERNAME: process.env.DB_USERNAME || 'inventory_user',
    PASSWORD: process.env.DB_PASSWORD || 'inventory_pass',
    DATABASE: process.env.DB_DATABASE || 'inventory_db',
  },

  // RabbitMQ
  RABBITMQ: {
    URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    QUEUE: process.env.RABBITMQ_QUEUE_INVENTORY || 'inventory_queue',
    EXCHANGE: process.env.RABBITMQ_EXCHANGE || 'ecommerce_events',
  },

  // Locking Strategy
  LOCKING_STRATEGY: process.env.LOCKING_STRATEGY || 'PESSIMISTIC',
});
