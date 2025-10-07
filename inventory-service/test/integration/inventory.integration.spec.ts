import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Inventory } from '../../src/inventory/domain/entities/inventory.entity';
import { InventoryStatus } from '../../src/inventory/domain/enums/locking-strategy.enum';
import { DataSource } from 'typeorm';

describe('Inventory Integration Tests - Pessimistic Locking (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    await app.init();
    dataSource = moduleFixture.get(DataSource);

    // Seed test data
    await seedTestData(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {
    // Reset inventory after each test
    await resetInventory(dataSource);
  });

  describe('Race Condition Test - 10 users, 1 stock', () => {
    it('should only allow 1 successful reservation with pessimistic locking', async () => {
      const productId = 'prod_test_001';

      // 10 usuarios intentando reservar simultáneamente
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .put('/inventory/reserve')
          .send({
            orderId: `ord_race_${i}`,
            productId,
            quantity: 1,
            lockingStrategy: 'PESSIMISTIC',
          }),
      );

      const responses = await Promise.all(requests);

      const successfulReservations = responses.filter((r) => r.status === 200);
      const failedReservations = responses.filter((r) => r.status === 409);

      expect(successfulReservations.length).toBe(1);
      expect(failedReservations.length).toBe(9);

      // Verificar stock final
      const inventory = await dataSource.getRepository(Inventory).findOne({ where: { productId } });

      if (!inventory) {
        throw new Error('Inventory should exist');
      }

      expect(inventory.availableQuantity).toBe(0);
      expect(inventory.reservedQuantity).toBe(1);
      expect(inventory.status).toBe(InventoryStatus.OUT_OF_STOCK);
    }, 30000); // 30 segundos timeout
  });

  describe('High Concurrency Test - 25 users, 10 stock', () => {
    it('should handle 25 concurrent requests with 10 stock correctly', async () => {
      const productId = 'prod_test_002';

      const requests = Array.from({ length: 25 }, (_, i) =>
        request(app.getHttpServer())
          .put('/inventory/reserve')
          .send({
            orderId: `ord_concurrent_${i}`,
            productId,
            quantity: 1,
            lockingStrategy: 'PESSIMISTIC',
          }),
      );

      const responses = await Promise.all(requests);

      const successfulReservations = responses.filter((r) => r.status === 200);
      const failedReservations = responses.filter((r) => r.status === 409);

      expect(successfulReservations.length).toBe(10);
      expect(failedReservations.length).toBe(15);

      const inventory = await dataSource.getRepository(Inventory).findOne({ where: { productId } });

      expect(inventory.availableQuantity).toBe(0);
      expect(inventory.reservedQuantity).toBe(10);
      expect(inventory.status).toBe(InventoryStatus.OUT_OF_STOCK);
    }, 30000);
  });

  describe('Check Availability', () => {
    it('should return availability for existing product', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/availability/prod-001')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('productId', 'prod-001');
      expect(response.body).toHaveProperty('availableQuantity');
    });

    it('should return not found for non-existing product', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/availability/prod-999')
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('availableQuantity', 0);
    });
  });
});

async function seedTestData(dataSource: DataSource) {
  const inventoryRepo = dataSource.getRepository(Inventory);

  const products = [
    {
      productId: 'prod_001',
      productName: 'Laptop Dell XPS 13',
      availableQuantity: 50,
      reservedQuantity: 0,
      price: 199.99,
      status: InventoryStatus.AVAILABLE,
    },
    {
      productId: 'prod_test_001',
      productName: 'Product Race Condition Test (1 unit)',
      availableQuantity: 1,
      reservedQuantity: 0,
      price: 99.99,
      status: InventoryStatus.AVAILABLE,
    },
    {
      productId: 'prod_test_002',
      productName: 'Product High Concurrency Test (10 units)',
      availableQuantity: 10,
      reservedQuantity: 0,
      price: 199.99,
      status: InventoryStatus.AVAILABLE,
    },
  ];

  for (const product of products) {
    const existing = await inventoryRepo.findOne({ where: { productId: product.productId } });
    if (!existing) {
      await inventoryRepo.save(product);
    }
  }
}

async function resetInventory(dataSource: DataSource) {
  await dataSource.query(
    `UPDATE inventory SET available_quantity = 1, reserved_quantity = 0, status = $1 WHERE product_id = $2`,
    [InventoryStatus.AVAILABLE, 'prod_test_001'],
  );
  await dataSource.query(
    `UPDATE inventory SET available_quantity = 10, reserved_quantity = 0, status = $1 WHERE product_id = $2`,
    [InventoryStatus.AVAILABLE, 'prod_test_002'],
  );
}
