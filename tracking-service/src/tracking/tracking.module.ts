import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { TrackingDomainService } from '@domain/services/tracking-domain.service';
import { TRACKING_REPOSITORY_PORT } from '@domain/ports/out/tracking-repository.port';

// Application
import { LogEventUseCase } from '@application/use-cases/log-event.use-case';
import { GetOrderTimelineUseCase } from '@application/use-cases/get-order-timeline.use-case';
import { GetAllEventsUseCase } from '@application/use-cases/get-all-events.use-case';

// Infrastructure
import { TrackingEventEntity } from '@infrastructure/adapters/out/persistence/entities/tracking-event.entity';
import { TypeOrmTrackingRepository } from '@infrastructure/adapters/out/persistence/typeorm-tracking.repository';
import { RabbitMQTrackingEventsController } from '@infrastructure/adapters/in/rabbitmq-tracking-events.controller';
import { HttpTrackingController } from '@infrastructure/adapters/in/http-tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingEventEntity])],
  controllers: [RabbitMQTrackingEventsController, HttpTrackingController],
  providers: [
    // Domain
    TrackingDomainService,

    // Application
    LogEventUseCase,
    GetOrderTimelineUseCase,
    GetAllEventsUseCase,

    // Infrastructure
    {
      provide: TRACKING_REPOSITORY_PORT,
      useClass: TypeOrmTrackingRepository,
    },
  ],
})
export class TrackingModule {}
