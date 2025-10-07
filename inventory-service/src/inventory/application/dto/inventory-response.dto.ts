import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  availableQuantity: number;

  @ApiProperty()
  reservedQuantity: number;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  lockingStrategy?: string;
}
