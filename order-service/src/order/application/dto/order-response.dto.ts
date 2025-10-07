export class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class OrderResponseDto {
  orderId: string;
  userId: string;
  status: string;
  items: OrderItemResponseDto[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}