import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'prod-001' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  availableQuantity: number;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;
}