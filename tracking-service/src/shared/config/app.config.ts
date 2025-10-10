export const getAppConfig = () => ({
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: 'tracking-service',
});
