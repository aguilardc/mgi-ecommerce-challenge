import { Test, TestingModule } from '@nestjs/testing';
import { CheckAvailabilityUseCase } from '../../src/inventory/application/use-cases/check-availability.use-case';
import { INVENTORY_REPOSITORY } from '../../src/inventory/application/ports/out/inventory.repository.interface';
import { Inventory } from '../../src/inventory/domain/entities/inventory.entity';
import { InventoryStatus } from '../../src/inventory/domain/enums/locking-strategy.enum';

describe('CheckAvailabilityUseCase', () => {
  let useCase: CheckAvailabilityUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findByProductId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckAvailabilityUseCase,
        {
          provide: INVENTORY_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckAvailabilityUseCase>(CheckAvailabilityUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return availability for existing product', async () => {
      const mockInventory: Partial<Inventory> = {
        id: '1',
        productId: 'prod-001',
        productName: 'Test Product',
        availableQuantity: 10,
        reservedQuantity: 5,
        price: 99.99,
        status: InventoryStatus.AVAILABLE,
        version: 1,
      };

      mockRepository.findByProductId.mockResolvedValue(mockInventory);

      const result = await useCase.execute('prod-001');

      expect(result.success).toBe(true);
      expect(result.productId).toBe('prod-001');
      expect(result.availableQuantity).toBe(10);
      expect(result.reservedQuantity).toBe(5);
      expect(mockRepository.findByProductId).toHaveBeenCalledWith('prod-001');
    });

    it('should return not found for non-existing product', async () => {
      mockRepository.findByProductId.mockResolvedValue(null);

      const result = await useCase.execute('prod-999');

      expect(result.success).toBe(false);
      expect(result.productId).toBe('prod-999');
      expect(result.availableQuantity).toBe(0);
      expect(result.reservedQuantity).toBe(0);
      expect(result.message).toBe('Product not found');
    });
  });
});
