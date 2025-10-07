import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { InventoryStatus } from '../enums/locking-strategy.enum';

@Entity('inventory')
@Index(['productId'], { unique: true })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 255, name: 'product_name' })
  productName: string;

  @Column({ type: 'int', default: 0, name: 'available_quantity' })
  availableQuantity: number;

  @Column({ type: 'int', default: 0, name: 'reserved_quantity' })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.AVAILABLE,
  })
  status: InventoryStatus;

  // Para Optimistic Locking
  @VersionColumn({ name: 'version' })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Business logic
  canReserve(quantity: number): boolean {
    return this.availableQuantity >= quantity && this.status === InventoryStatus.AVAILABLE;
  }

  reserve(quantity: number): void {
    if (!this.canReserve(quantity)) {
      throw new Error(`Insufficient stock for product ${this.productId}`);
    }
    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
    this.updateStatus();
  }

  release(quantity: number): void {
    this.reservedQuantity -= quantity;
    this.availableQuantity += quantity;
    this.updateStatus();
  }

  private updateStatus(): void {
    if (this.availableQuantity <= 0) {
      this.status = InventoryStatus.OUT_OF_STOCK;
    } else {
      this.status = InventoryStatus.AVAILABLE;
    }
  }
}
