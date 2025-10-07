export enum LockingStrategy {
  PESSIMISTIC = 'PESSIMISTIC',
  OPTIMISTIC = 'OPTIMISTIC',
  APPLICATION = 'APPLICATION',
}

export enum InventoryOperation {
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  CHECK = 'CHECK',
}

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
