import { Inject, Injectable, Logger } from '@nestjs/common';
import { LogEventCommand } from '@domain/ports/in/tracking-use-cases.port';
import {
  TRACKING_REPOSITORY_PORT,
  TrackingRepositoryPort,
} from '@domain/ports/out/tracking-repository.port';
import {
  TrackingEvent,
  EventType,
  EventSource,
} from '@domain/models/tracking-event.model';
import { TrackingDomainService } from '@domain/services/tracking-domain.service';

@Injectable()
export class LogEventUseCase {
  private readonly logger = new Logger(LogEventUseCase.name);

  constructor(
    @Inject(TRACKING_REPOSITORY_PORT)
    private readonly trackingRepository: TrackingRepositoryPort,
    private readonly domainService: TrackingDomainService,
  ) {}

  async execute(command: LogEventCommand): Promise<TrackingEvent> {
    this.logger.log(
      `Logging event: ${command.eventType} for order ${command.orderId}`,
    );

    const event = TrackingEvent.create({
      eventType: command.eventType as EventType,
      eventSource: command.eventSource as EventSource,
      orderId: command.orderId,
      payload: command.payload,
      metadata: this.domainService.enrichEventMetadata(
        TrackingEvent.create({
          eventType: command.eventType as EventType,
          eventSource: command.eventSource as EventSource,
          orderId: command.orderId,
          payload: command.payload,
        }),
        command.metadata,
      ),
    });

    this.domainService.validateEvent(event);

    const savedEvent = await this.trackingRepository.save(event);

    this.logger.log(`Event logged successfully: ${savedEvent.id}`);

    return savedEvent;
  }
}
