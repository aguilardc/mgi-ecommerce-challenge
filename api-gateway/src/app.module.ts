import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './presentation/controllers/orders.controller';
import { TrackingController } from './presentation/controllers/tracking.controller';
import { RabbitMQClientService } from './messaging/rabbitmq-client.service';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
  ],
  controllers: [OrdersController, TrackingController],
  providers: [RabbitMQClientService],
})
export class AppModule {}
