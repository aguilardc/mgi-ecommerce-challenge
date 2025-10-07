import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.log(`← ${method} ${url} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `✗ ${method} ${url} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}