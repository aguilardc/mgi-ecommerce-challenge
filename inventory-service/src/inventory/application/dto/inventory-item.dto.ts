import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemDto {
  @ApiProperty({ example: 'prod_001' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  availableQuantity: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  reservedQuantity: number;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'AVAILABLE', enum: ['AVAILABLE', 'RESERVED', 'OUT_OF_STOCK'] })
  @IsString()
  status: string;
}