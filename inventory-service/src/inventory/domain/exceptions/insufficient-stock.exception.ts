import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productId: string, requested: number, available: number) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`,
        error: 'InsufficientStock',
      },
      HttpStatus.CONFLICT,
    );
  }
}
