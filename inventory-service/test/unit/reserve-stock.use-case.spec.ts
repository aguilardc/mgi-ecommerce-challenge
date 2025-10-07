import { Test, TestingModule } from '@nestjs/testing';
import { ReserveStockUseCase } from '../../src/inventory/application/use-cases/reserve-stock.use-case';
import { INVENTORY_REPOSITORY } from '../../src/inventory/application/ports/out/inventory.repository.interface';
import { EVENT_PUBLISHER } from '../../src/inventory/application/ports/out/event.publisher.interface';
import { InsufficientStockException } from '../../src/inventory/domain/exceptions/insufficient-stock.exception';
import { Inventory } from '../../src/inventory/domain/entities/inventory.entity';
import { InventoryStatus } from '../../src/inventory/domain/enums/locking-strategy.enum';

describe('ReserveStockUseCase', () => {
  let useCase: ReserveStockUseCase;
  let mockRepository: any;
  let mockEventPublisher: any;

  beforeEach(async () => {
    mockRepository = {
      reserve: jest.fn(),
      findByProductId: jest.fn(),
    };

    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReserveStockUseCase,
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

    useCase = module.get<ReserveStockUseCase>(ReserveStockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should reserve stock successfully', async () => {
      const dto = {
        orderId: 'ord_123',
        productId: 'prod_001',
        quantity: 2,
        lockingStrategy: 'PESSIMISTIC' as any,
      };

      const mockInventory: Partial<Inventory> = {
        id: '1',
        productId: 'prod_001',
        productName: 'Test Product',
        availableQuantity: 8,
        reservedQuantity: 2,
        price: 99.99,
        status: InventoryStatus.AVAILABLE,
        version: 1,
      };

      mockRepository.reserve.mockResolvedValue(mockInventory);

      const result = await useCase.execute(dto);

      expect(result.success).toBe(true);
      expect(result.productId).toBe('prod_001');
      expect(result.availableQuantity).toBe(8);
      expect(result.reservedQuantity).toBe(2);
      expect(mockRepository.reserve).toHaveBeenCalledWith('prod_001', 2, 'ord_123');
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });

    it('should throw InsufficientStockException when stock is insufficient', async () => {
      const dto = {
        orderId: 'ord_123',
        productId: 'prod_001',
        quantity: 20,
        lockingStrategy: 'PESSIMISTIC' as any,
      };

      mockRepository.reserve.mockRejectedValue(new InsufficientStockException('prod_001', 20, 5));

      mockRepository.findByProductId.mockResolvedValue({
        availableQuantity: 5,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(InsufficientStockException);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
    });

    it('should publish failure event on error', async () => {
      const dto = {
        orderId: 'ord_123',
        productId: 'prod_001',
        quantity: 2,
        lockingStrategy: 'PESSIMISTIC' as any,
      };

      const error = new Error('Database connection failed');
      mockRepository.reserve.mockRejectedValue(error);
      mockRepository.findByProductId.mockResolvedValue({
        availableQuantity: 10,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(error);
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });
  });
});
