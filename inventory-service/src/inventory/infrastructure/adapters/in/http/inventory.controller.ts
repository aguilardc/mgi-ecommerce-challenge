import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReserveStockDto, BulkReserveStockDto } from '@application/dto/reserve-stock.dto';
import { ReleaseStockDto } from '@application/dto/release-stock.dto';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';
import { ReserveStockUseCase } from '@application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from '@application/use-cases/release-stock.use-case';
import { CheckAvailabilityUseCase } from '@application/use-cases/check-availability.use-case';
import { BulkInventoryResponseDto } from '@application/dto/bulk-inventory-response.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly releaseStockUseCase: ReleaseStockUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  ) {}

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reserve stock for a single product' })
  @ApiResponse({
    status: 200,
    description: 'Stock reserved successfully',
    type: InventoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async reserveStock(@Body() dto: ReserveStockDto): Promise<InventoryResponseDto> {
    this.logger.log(`Received reserve request for order ${dto.orderId}`);
    return this.reserveStockUseCase.execute(dto);
  }

  @Post('reserve/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reserve stock for multiple products' })
  @ApiResponse({
    status: 200,
    description: 'Stock reserved successfully',
    type: BulkInventoryResponseDto,
  })
  async bulkReserveStock(@Body() dto: BulkReserveStockDto): Promise<BulkInventoryResponseDto> {
    this.logger.log(`Received bulk reserve request for order ${dto.orderId}`);

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
        this.logger.error(`Failed to reserve ${item.productId}: ${error.message}`);
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
              `Rollback failed for ${reserved.productId}: ${rollbackError.message}`,
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

  @Post('release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release reserved stock' })
  @ApiResponse({
    status: 200,
    description: 'Stock released successfully',
    type: InventoryResponseDto,
  })
  async releaseStock(@Body() dto: ReleaseStockDto): Promise<InventoryResponseDto> {
    this.logger.log(`Received release request for order ${dto.orderId}`);
    return this.releaseStockUseCase.execute(dto);
  }

  @Get('availability/:productId')
  @ApiOperation({ summary: 'Check product availability' })
  @ApiResponse({ status: 200, description: 'Availability checked', type: InventoryResponseDto })
  async checkAvailability(@Param('productId') productId: string): Promise<InventoryResponseDto> {
    return this.checkAvailabilityUseCase.execute(productId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  healthCheck() {
    return { status: 'ok', service: 'inventory-service' };
  }
}
