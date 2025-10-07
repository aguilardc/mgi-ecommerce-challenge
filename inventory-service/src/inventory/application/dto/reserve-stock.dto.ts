import { IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LockingStrategy } from '@domain/enums/locking-strategy.enum';

export class ReserveStockDto {
  @ApiProperty({ example: 'ord_12345' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'prod_001' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: LockingStrategy, required: false })
  @IsOptional()
  @IsEnum(LockingStrategy)
  lockingStrategy?: LockingStrategy;
}

export class ReserveStockItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class BulkReserveStockDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ type: [ReserveStockItemDto] })
  items: ReserveStockItemDto[];

  @ApiProperty({ enum: LockingStrategy, required: false })
  @IsOptional()
  @IsEnum(LockingStrategy)
  lockingStrategy?: LockingStrategy;
}
