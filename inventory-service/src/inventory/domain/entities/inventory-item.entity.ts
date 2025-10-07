import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('inventory')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', unique: true })
  productId: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'available_quantity', type: 'int', default: 0 })
  availableQuantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 50, default: 'AVAILABLE' })
  status: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
