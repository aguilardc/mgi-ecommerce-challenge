import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetOrderTimelineQuery } from '@domain/ports/in/tracking-use-cases.port';
import {
  TRACKING_REPOSITORY_PORT,
  TrackingRepositoryPort,
} from '@domain/ports/out/tracking-repository.port';
import { TrackingEvent } from '@domain/models/tracking-event.model';
import { TrackingDomainService } from '@domain/services/tracking-domain.service';

@Injectable()
export class GetOrderTimelineUseCase {
  private readonly logger = new Logger(GetOrderTimelineUseCase.name);

  constructor(
    @Inject(TRACKING_REPOSITORY_PORT)
    private readonly trackingRepository: TrackingRepositoryPort,
    private readonly domainService: TrackingDomainService,
  ) {}

  async execute(query: GetOrderTimelineQuery): Promise<TrackingEvent[]> {
    this.logger.log(`Getting timeline for order: ${query.orderId}`);

    const events = await this.trackingRepository.findByOrderId(query.orderId);

    const sortedEvents = this.domainService.sortEventsByTimestamp(events);

    this.logger.log(
      `Found ${sortedEvents.length} events for order ${query.orderId}`,
    );

    return sortedEvents;
  }
}
