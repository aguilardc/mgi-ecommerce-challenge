import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReleaseStockDto } from '@application/dto/release-stock.dto';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from '@application/ports/out/inventory.repository.interface';
import { IEventPublisher, EVENT_PUBLISHER } from '@application/ports/out/event.publisher.interface';
import { InventoryReleasedEvent } from '@shared/events/inventory.events';
import { RABBITMQ_CONFIG } from '@shared/config/rabbitmq.config';

@Injectable()
export class ReleaseStockUseCase {
  private readonly logger = new Logger(ReleaseStockUseCase.name);

  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: ReleaseStockDto): Promise<InventoryResponseDto> {
    this.logger.log(
      `Releasing stock for order ${dto.orderId}, product ${dto.productId}, quantity ${dto.quantity}`,
    );

    try {
      const inventory = await this.inventoryRepository.release(
        dto.productId,
        dto.quantity,
        dto.orderId,
      );

      const response: InventoryResponseDto = {
        success: true,
        productId: inventory.productId,
        availableQuantity: inventory.availableQuantity,
        reservedQuantity: inventory.reservedQuantity,
        message: 'Stock released successfully',
      };

      const event: InventoryReleasedEvent = {
        orderId: dto.orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        timestamp: new Date().toISOString(),
      };

      await this.eventPublisher.publish(RABBITMQ_CONFIG.ROUTING_KEYS.INVENTORY_RELEASED, event);

      return response;
    } catch (error) {
      this.logger.error(`Failed to release stock: ${error.message}`, error.stack);
      throw error;
    }
  }
}
