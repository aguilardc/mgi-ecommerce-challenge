import { TrackingEvent } from '@domain/models/tracking-event.model';

export interface LogEventCommand {
  eventType: string;
  eventSource: string;
  orderId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface GetOrderTimelineQuery {
  orderId: string;
}

export interface GetAllEventsQuery {
  limit?: number;
  offset?: number;
  eventType?: string;
  eventSource?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TrackingUseCasesPort {
  logEvent(command: LogEventCommand): Promise<TrackingEvent>;
  getOrderTimeline(query: GetOrderTimelineQuery): Promise<TrackingEvent[]>;
  getAllEvents(query: GetAllEventsQuery): Promise<{
    events: TrackingEvent[];
    total: number;
  }>;
}

export const TRACKING_USE_CASES_PORT = Symbol('TRACKING_USE_CASES_PORT');
