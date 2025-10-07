import { Injectable, Logger } from '@nestjs/common';
import { IInventoryService } from '@application/ports/in/inventory.service.interface';
import { ReserveStockDto, BulkReserveStockDto } from '@application/dto/reserve-stock.dto';
import { ReleaseStockDto } from '@application/dto/release-stock.dto';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';
import { BulkInventoryResponseDto } from '@application/dto/bulk-inventory-response.dto';
import { ReserveStockUseCase } from '@application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from '@application/use-cases/release-stock.use-case';
import { CheckAvailabilityUseCase } from '@application/use-cases/check-availability.use-case';

@Injectable()
export class InventoryService implements IInventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly releaseStockUseCase: ReleaseStockUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  ) {}

  async reserveStock(dto: ReserveStockDto): Promise<InventoryResponseDto> {
    this.logger.log(`Reserving stock for order ${dto.orderId}`);
    return this.reserveStockUseCase.execute(dto);
  }

  async bulkReserveStock(dto: BulkReserveStockDto): Promise<BulkInventoryResponseDto> {
    this.logger.log(`Bulk reserving stock for order ${dto.orderId}`);

    const results: InventoryResponseDto[] = [];
    const failedItems: string[] = [];

    for (const item of dto.items) {
      try {
        const result = await this.reserveStockUseCase.execute({
          orderId: dto.orderId,
          productId: item.productId,
          quantity: item.quantity,
          lockingStrategy: dto.lockingStrategy,
        });
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to reserve ${item.productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        failedItems.push(item.productId);

        // Rollback: liberar items ya reservados
        for (const reserved of results) {
          try {
            const itemToRelease = dto.items.find((i) => i.productId === reserved.productId);
            if (itemToRelease) {
              await this.releaseStockUseCase.execute({
                orderId: dto.orderId,
                productId: reserved.productId,
                quantity: itemToRelease.quantity,
              });
            }
          } catch (rollbackError) {
            this.logger.error(
              `Rollback failed for ${reserved.productId}: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`,
            );
          }
        }

        throw error;
      }
    }

    return {
      success: failedItems.length === 0,
      orderId: dto.orderId,
      items: results,
      failedItems: failedItems.length > 0 ? failedItems : undefined,
      message:
        failedItems.length === 0
          ? 'All items reserved successfully'
          : 'Some items failed to reserve',
    };
  }

  async releaseStock(dto: ReleaseStockDto): Promise<InventoryResponseDto> {
    this.logger.log(`Releasing stock for order ${dto.orderId}`);
    return this.releaseStockUseCase.execute(dto);
  }

  async checkAvailability(productId: string): Promise<InventoryResponseDto> {
    this.logger.log(`Checking availability for product ${productId}`);
    return this.checkAvailabilityUseCase.execute(productId);
  }
}
