import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { RabbitMQClientService } from '../../messaging/rabbitmq-client.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { GetOrderParamDto } from '../dto/get-order.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@Controller('orders')
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly rabbitMQClient: RabbitMQClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ApiResponseDto<any> | null> {
    this.logger.log(`Creating order for user: ${createOrderDto.userId}`);

    return await this.rabbitMQClient.send('order.create', createOrderDto);
  }

  @Get(':id')
  async getOrder(
    @Param() params: GetOrderParamDto,
  ): Promise<ApiResponseDto<any> | null> {
    this.logger.log(`Getting order: ${params.id}`);

    return await this.rabbitMQClient.send('order.get', {
      orderId: params.id,
    });
  }
}
