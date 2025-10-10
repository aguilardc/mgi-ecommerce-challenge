import { IsString, IsObject, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventSource } from '@domain/models/tracking-event.model';

export class TrackingEventDto {
  @IsString()
  id: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsEnum(EventSource)
  eventSource: EventSource;

  @IsString()
  orderId: string;

  @IsObject()
  payload: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsString()
  correlationId: string;
}
