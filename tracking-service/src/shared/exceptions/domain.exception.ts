export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidEventException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEventException';
  }
}

export class EventNotFoundException extends DomainException {
  constructor(eventId: string) {
    super(`Event with ID ${eventId} not found`);
    this.name = 'EventNotFoundException';
  }
}