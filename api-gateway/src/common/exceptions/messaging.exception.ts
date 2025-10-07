import { HttpException, HttpStatus } from '@nestjs/common';

export class MessagingException extends HttpException {
  constructor(message: string, service?: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: `Service communication failed: ${message}`,
        service,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}