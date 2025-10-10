import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TrackingEventEntity } from '@infrastructure/adapters/out/persistence/entities/tracking-event.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'tracking_user',
  password: process.env.DB_PASSWORD || 'tracking_pass',
  database: process.env.DB_NAME || 'tracking_db',
  entities: [TrackingEventEntity],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
