export class InfrastructureException extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'InfrastructureException';
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    this.name = 'DatabaseException';
  }
}

export class MessagingException extends InfrastructureException {
  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    this.name = 'MessagingException';
  }
}
