import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetAllEventsQuery } from '@domain/ports/in/tracking-use-cases.port';
import {
  TRACKING_REPOSITORY_PORT,
  TrackingRepositoryPort,
} from '@domain/ports/out/tracking-repository.port';
import { TrackingEvent } from '@domain/models/tracking-event.model';

@Injectable()
export class GetAllEventsUseCase {
  private readonly logger = new Logger(GetAllEventsUseCase.name);

  constructor(
    @Inject(TRACKING_REPOSITORY_PORT)
    private readonly trackingRepository: TrackingRepositoryPort,
  ) {}

  async execute(query: GetAllEventsQuery): Promise<{
    events: TrackingEvent[];
    total: number;
  }> {
    this.logger.log('Getting all events with filters', query);

    const result = await this.trackingRepository.findAll({
      limit: query.limit || 100,
      offset: query.offset || 0,
      eventType: query.eventType,
      eventSource: query.eventSource,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    this.logger.log(`Found ${result.total} total events, returning ${result.events.length}`);

    return result;
  }
}
