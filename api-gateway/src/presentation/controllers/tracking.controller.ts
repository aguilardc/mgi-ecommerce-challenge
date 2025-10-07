import {
  Controller,
  Get,
  Logger,
  Param,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { RabbitMQClientService } from '../../messaging/rabbitmq-client.service';
import { GetTrackingParamDto } from '../dto/get-tracking.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@Controller('tracking')
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly rabbitMQClient: RabbitMQClientService) {}

  @Get(':orderId')
  async getTracking(
    @Param() params: GetTrackingParamDto,
  ): Promise<ApiResponseDto<any> | null> {
    this.logger.log(`Getting tracking for order: ${params.orderId}`);

    return await this.rabbitMQClient.send('tracking.get', {
      orderId: params.orderId,
    });
  }
}