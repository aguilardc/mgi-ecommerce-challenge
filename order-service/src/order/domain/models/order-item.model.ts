export class OrderItemModel {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }

    const expectedSubtotal = this.quantity * this.unitPrice;

    const diff = Math.abs(this.subtotal - expectedSubtotal);

    if (diff > 0.01) {
      throw new Error(
        `Subtotal must equal quantity * unitPrice. Expected: ${expectedSubtotal}, Got: ${this.subtotal}`,
      );
    }
  }

  static create(
    id: string,
    orderId: string,
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number,
  ): OrderItemModel {
    const subtotal = quantity * unitPrice;
    return new OrderItemModel(id, orderId, productId, productName, quantity, unitPrice, subtotal);
  }
}
