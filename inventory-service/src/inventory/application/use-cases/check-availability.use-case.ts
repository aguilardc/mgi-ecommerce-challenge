import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '@domain/entities/inventory.entity';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async execute(productId: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepo.findOne({
      where: { productId },
    });

    if (!inventory) {
      return {
        success: false,
        productId,
        availableQuantity: 0,
        reservedQuantity: 0,
        message: 'Product not found',
      };
    }

    return {
      success: true,
      productId: inventory.productId,
      availableQuantity: inventory.availableQuantity,
      reservedQuantity: inventory.reservedQuantity,
      message: 'Product found',
    };
  }
}
