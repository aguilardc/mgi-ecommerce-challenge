CREATE DATABASE tracking_db;

\c tracking_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tracking Events Table
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL,
    order_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        correlation_id VARCHAR(100) NOT NULL
    );

-- Indexes for performance
CREATE INDEX idx_tracking_events_order_id_timestamp ON tracking_events(order_id, timestamp);
CREATE INDEX idx_tracking_events_event_type_timestamp ON tracking_events(event_type, timestamp);
CREATE INDEX idx_tracking_events_event_source_timestamp ON tracking_events(event_source, timestamp);
CREATE INDEX idx_tracking_events_correlation_id ON tracking_events(correlation_id);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp DESC);
CREATE INDEX idx_tracking_events_payload ON tracking_events USING GIN (payload);

-- Insert sample data for testing
INSERT INTO tracking_events (id, event_type, event_source, order_id, payload, metadata, correlation_id)
VALUES
    (uuid_generate_v4(), 'order.initiated', 'order-service', 'order-123',
     '{"userId": "user-1", "items": [{"productId": "prod_1", "quantity": 2}]}'::jsonb,
     '{"version": "1.0", "recordedAt": "2025-10-08T10:00:00Z"}'::jsonb,
     'order-123'),
    (uuid_generate_v4(), 'stock.reserved', 'inventory-service', 'order-123',
     '{"productId": "prod_1", "quantity": 2, "orderId": "order-123"}'::jsonb,
     '{"version": "1.0", "recordedAt": "2025-10-08T10:00:05Z"}'::jsonb,
     'order-123'),
    (uuid_generate_v4(), 'order.confirmed', 'order-service', 'order-123',
     '{"orderId": "order-123", "status": "confirmed"}'::jsonb,
     '{"version": "1.0", "recordedAt": "2025-10-08T10:00:10Z"}'::jsonb,
     'order-123');

COMMENT ON TABLE tracking_events IS 'Stores all system events for audit and tracking purposes';
COMMENT ON COLUMN tracking_events.event_type IS 'Type of event (e.g., order.created, stock.reserved)';
COMMENT ON COLUMN tracking_events.event_source IS 'Service that emitted the event';
COMMENT ON COLUMN tracking_events.order_id IS 'Order ID for correlation';
COMMENT ON COLUMN tracking_events.payload IS 'Event data in JSON format';
COMMENT ON COLUMN tracking_events.metadata IS 'Additional metadata about the event';
COMMENT ON COLUMN tracking_events.correlation_id IS 'Correlation ID for tracing across services';