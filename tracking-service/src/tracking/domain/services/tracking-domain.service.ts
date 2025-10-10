import { Injectable } from '@nestjs/common';
import {
  TrackingEvent,
  EventType,
  EventSource,
} from '@domain/models/tracking-event.model';

@Injectable()
export class TrackingDomainService {
  validateEvent(event: TrackingEvent): void {
    if (!event.orderId || event.orderId.trim() === '') {
      throw new Error('Order ID is required');
    }

    if (!Object.values(EventType).includes(event.eventType)) {
      throw new Error(`Invalid event type: ${event.eventType}`);
    }

    if (!Object.values(EventSource).includes(event.eventSource)) {
      throw new Error(`Invalid event source: ${event.eventSource}`);
    }

    if (!event.payload || typeof event.payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }
  }

  enrichEventMetadata(
    event: TrackingEvent,
    additionalMetadata?: Record<string, any>,
  ): Record<string, any> {
    return {
      ...event.metadata,
      ...additionalMetadata,
      recordedAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  sortEventsByTimestamp(events: TrackingEvent[]): TrackingEvent[] {
    return [...events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  filterEventsByType(
    events: TrackingEvent[],
    eventType: EventType,
  ): TrackingEvent[] {
    return events.filter((e) => e.eventType === eventType);
  }

  getEventSummary(events: TrackingEvent[]): {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    events.forEach((event) => {
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
      bySource[event.eventSource] = (bySource[event.eventSource] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
      bySource,
    };
  }
}
