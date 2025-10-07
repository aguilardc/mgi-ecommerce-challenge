import { IsString, IsInt, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryItemDto {
  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableQuantity?: number;

  @ApiProperty({ example: 199.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 'AVAILABLE', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}