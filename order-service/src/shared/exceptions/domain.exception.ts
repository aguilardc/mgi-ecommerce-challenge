export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidOrderStatusException extends DomainException {
  constructor(currentStatus: string, attemptedAction: string) {
    super(`Cannot ${attemptedAction} order with status: ${currentStatus}`);
    this.name = 'InvalidOrderStatusException';
  }
}

export class InvalidOrderItemException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOrderItemException';
  }
}
