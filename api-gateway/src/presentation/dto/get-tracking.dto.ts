import { IsUUID } from 'class-validator';

export class GetTrackingParamDto {
  @IsUUID('4', { message: 'Invalid order ID format' })
  orderId: string;
}