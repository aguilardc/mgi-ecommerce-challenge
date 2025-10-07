import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseStockUseCase } from '../../src/inventory/application/use-cases/release-stock.use-case';
import { INVENTORY_REPOSITORY } from '../../src/inventory/application/ports/out/inventory.repository.interface';
import { EVENT_PUBLISHER } from '../../src/inventory/application/ports/out/event.publisher.interface';
import { Inventory } from '../../src/inventory/domain/entities/inventory.entity';
import { InventoryStatus } from '../../src/inventory/domain/enums/locking-strategy.enum';

describe('ReleaseStockUseCase', () => {
  let useCase: ReleaseStockUseCase;
  let mockRepository: any;
  let mockEventPublisher: any;

  beforeEach(async () => {
    mockRepository = {
      release: jest.fn(),
      findByProductId: jest.fn(),
    };

    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseStockUseCase,
        {
          provide: INVENTORY_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: EVENT_PUBLISHER,
          useValue: mockEventPublisher,
        },
      ],
    }).compile();

    useCase = module.get<ReleaseStockUseCase>(ReleaseStockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should release stock successfully', async () => {
      const dto = {
        orderId: 'ord_123',
        productId: 'prod-001',
        quantity: 2,
      };

      const mockInventory: Partial<Inventory> = {
        id: '1',
        productId: 'prod-001',
        productName: 'Test Product',
        availableQuantity: 12,
        reservedQuantity: 0,
        price: 99.99,
        status: InventoryStatus.AVAILABLE,
        version: 1,
      };

      mockRepository.release.mockResolvedValue(mockInventory);

      const result = await useCase.execute(dto);

      expect(result.success).toBe(true);
      expect(result.productId).toBe('prod-001');
      expect(result.availableQuantity).toBe(12);
      expect(result.reservedQuantity).toBe(0);
      expect(mockRepository.release).toHaveBeenCalledWith('prod-001', 2, 'ord_123');
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });

    it('should throw error when release fails', async () => {
      const dto = {
        orderId: 'ord_123',
        productId: 'prod-001',
        quantity: 2,
      };

      const error = new Error('Product not found');
      mockRepository.release.mockRejectedValue(error);

      await expect(useCase.execute(dto)).rejects.toThrow(error);
    });
  });
});
