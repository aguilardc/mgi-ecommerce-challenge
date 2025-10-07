import { HttpException, HttpStatus } from '@nestjs/common';

export class ConcurrencyException extends HttpException {
  constructor(message: string = 'Concurrency conflict detected') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'ConcurrencyConflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}
