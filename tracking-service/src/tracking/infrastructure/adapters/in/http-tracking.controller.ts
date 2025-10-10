import { Controller, Get, Param, Query, Logger, HttpStatus } from '@nestjs/common';
import { GetOrderTimelineUseCase } from '@application/use-cases/get-order-timeline.use-case';
import { GetAllEventsUseCase } from '@application/use-cases/get-all-events.use-case';
import { GetEventsQueryDto } from '@application/dto/get-events-query.dto';
import { TrackingDomainService } from '@domain/services/tracking-domain.service';

@Controller('api/tracking')
export class HttpTrackingController {
  private readonly logger = new Logger(HttpTrackingController.name);

  constructor(
    private readonly getOrderTimelineUseCase: GetOrderTimelineUseCase,
    private readonly getAllEventsUseCase: GetAllEventsUseCase,
    private readonly domainService: TrackingDomainService,
  ) {}

  @Get(':orderId')
  async getOrderTimeline(@Param('orderId') orderId: string) {
    this.logger.log(`GET /api/tracking/${orderId}`);

    const events = await this.getOrderTimelineUseCase.execute({ orderId });
    const summary = this.domainService.getEventSummary(events);

    return {
      statusCode: HttpStatus.OK,
      data: {
        orderId,
        events: events.map((e) => e.toJSON()),
        summary,
      },
    };
  }

  @Get()
  async getAllEvents(@Query() query: GetEventsQueryDto) {
    this.logger.log('GET /api/tracking/events', query);

    const result = await this.getAllEventsUseCase.execute({
      limit: query.limit,
      offset: query.offset,
      eventType: query.eventType,
      eventSource: query.eventSource,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return {
      statusCode: HttpStatus.OK,
      data: {
        events: result.events.map((e) => e.toJSON()),
        total: result.total,
        limit: query.limit || 100,
        offset: query.offset || 0,
      },
    };
  }
}
