import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { InventoryOperation } from '../enums/locking-strategy.enum';

@Entity('inventory_logs')
@Index(['productId', 'orderId'])
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 255, name: 'order_id', nullable: true })
  orderId: string;

  @Column({
    type: 'enum',
    enum: InventoryOperation,
  })
  operation: InventoryOperation;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', name: 'quantity_before' })
  quantityBefore: number;

  @Column({ type: 'int', name: 'quantity_after' })
  quantityAfter: number;

  @Column({ type: 'varchar', length: 50, name: 'locking_strategy' })
  lockingStrategy: string;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
