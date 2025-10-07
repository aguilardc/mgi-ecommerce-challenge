export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`,
    );
    this.name = 'InsufficientStockException';
  }
}

export class ConcurrencyException extends DomainException {
  constructor(message: string = 'Concurrency conflict detected') {
    super(message);
    this.name = 'ConcurrencyException';
  }
}

export class ProductNotFoundException extends DomainException {
  constructor(productId: string) {
    super(`Product ${productId} not found`);
    this.name = 'ProductNotFoundException';
  }
}
