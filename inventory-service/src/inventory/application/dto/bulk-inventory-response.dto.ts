import { ApiProperty } from '@nestjs/swagger';
import { InventoryResponseDto } from '@application/dto/inventory-response.dto';

export class BulkInventoryResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  orderId: string;

  @ApiProperty({ type: [InventoryResponseDto] })
  items: InventoryResponseDto[];

  @ApiProperty({ required: false })
  failedItems?: string[];

  @ApiProperty({ required: false })
  message?: string;
}
