export class InfrastructureException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InfrastructureException';
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'DatabaseException';
  }
}

export class MessageBrokerException extends InfrastructureException {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MessageBrokerException';
  }
}
