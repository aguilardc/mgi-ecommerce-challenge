import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReserveStockDto } from '@application/dto/reserve-stock.dto';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from '@application/ports/out/inventory.repository.interface';
import { IEventPublisher, EVENT_PUBLISHER } from '@application/ports/out/event.publisher.interface';
import { RABBITMQ_CONFIG } from '@shared/config/rabbitmq.config';
import {
  InventoryReservedEvent,
  InventoryReserveFailedEvent,
} from '@shared/events/inventory.events';

@Injectable()
export class ReserveStockUseCase {
  private readonly logger = new Logger(ReserveStockUseCase.name);

  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: ReserveStockDto): Promise<InventoryResponseDto> {
    this.logger.log(
      `Reserving stock for order ${dto.orderId}, product ${dto.productId}, quantity ${dto.quantity}`,
    );

    try {
      const inventory = await this.inventoryRepository.reserve(
        dto.productId,
        dto.quantity,
        dto.orderId,
      );

      const response: InventoryResponseDto = {
        success: true,
        productId: inventory.productId,
        availableQuantity: inventory.availableQuantity,
        reservedQuantity: inventory.reservedQuantity,
        message: 'Stock reserved successfully',
        lockingStrategy: dto.lockingStrategy,
      };

      // Publicar evento tipado: inventory.reserved
      const event: InventoryReservedEvent = {
        orderId: dto.orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        lockingStrategy: dto.lockingStrategy,
        timestamp: new Date().toISOString(),
      };

      await this.eventPublisher.publish(RABBITMQ_CONFIG.ROUTING_KEYS.INVENTORY_RESERVED, event);

      return response;
    } catch (error) {
      this.logger.error(
        `Failed to reserve stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );

      // Obtener cantidad disponible actual para el evento
      let availableQuantity = 0;
      try {
        const currentInventory = await this.inventoryRepository.findByProductId(dto.productId);
        availableQuantity = currentInventory?.availableQuantity ?? 0;
      } catch {
        // Si falla obtener el inventario, dejar en 0
      }

      // Publicar evento tipado: inventory.reserve.failed
      const failedEvent: InventoryReserveFailedEvent = {
        orderId: dto.orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        reason: error instanceof Error ? error.message : 'Unknown error',
        availableQuantity,
        timestamp: new Date().toISOString(),
      };

      await this.eventPublisher.publish(
        RABBITMQ_CONFIG.ROUTING_KEYS.INVENTORY_RESERVE_FAILED,
        failedEvent,
      );

      throw error;
    }
  }
}
