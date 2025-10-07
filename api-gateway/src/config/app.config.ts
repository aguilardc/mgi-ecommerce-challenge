export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    timeout: parseInt(process.env.RABBITMQ_TIMEOUT ?? '30000', 10),
  },
});
