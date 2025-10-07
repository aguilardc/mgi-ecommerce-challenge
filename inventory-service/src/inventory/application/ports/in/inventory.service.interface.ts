import { ReserveStockDto, BulkReserveStockDto } from '@application/dto/reserve-stock.dto';
import { ReleaseStockDto } from '@application/dto/release-stock.dto';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';
import { BulkInventoryResponseDto } from '@application/dto/bulk-inventory-response.dto';

export interface IInventoryService {
  reserveStock(dto: ReserveStockDto): Promise<InventoryResponseDto>;
  bulkReserveStock(dto: BulkReserveStockDto): Promise<BulkInventoryResponseDto>;
  releaseStock(dto: ReleaseStockDto): Promise<InventoryResponseDto>;
  checkAvailability(productId: string): Promise<InventoryResponseDto>;
}

export const INVENTORY_SERVICE = Symbol('INVENTORY_SERVICE');
