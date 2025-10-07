import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Inventory } from '@domain/entities/inventory.entity';
import { InventoryLog } from '@domain/entities/inventory-log.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT') || '5433', 10),
  username: configService.get<string>('DB_USERNAME') || 'inventory_user',
  password: configService.get<string>('DB_PASSWORD') || 'inventory_pass',
  database: configService.get<string>('DB_DATABASE') || 'inventory_db',
  entities: [Inventory, InventoryLog],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  migrationsRun: false,
  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
