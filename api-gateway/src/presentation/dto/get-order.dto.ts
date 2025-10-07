import { IsUUID } from 'class-validator';

export class GetOrderParamDto {
  @IsUUID('4', { message: 'Invalid order ID format' })
  id: string;
}
