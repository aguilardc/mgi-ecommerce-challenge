import { TrackingEventDto } from '@application/dto/tracking-event.dto';

export class TimelineResponseDto {
  orderId: string;
  events: TrackingEventDto[];
  summary: {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export class EventsResponseDto {
  events: TrackingEventDto[];
  total: number;
  limit: number;
  offset: number;
}
