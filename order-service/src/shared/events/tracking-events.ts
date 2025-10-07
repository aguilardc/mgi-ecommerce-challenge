export class TrackingEvent {
  constructor(
    public readonly orderId: string,
    public readonly eventType: string,
    public readonly eventData: any,
    public readonly serviceName: string,
    public readonly message: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
