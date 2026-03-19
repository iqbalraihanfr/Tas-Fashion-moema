import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productService from '@/services/product.service';
import * as productRepo from '@/services/database/product.repository';
import * as storageService from '@/services/storage.service';

// Mock dependencies
vi.mock('@/services/database/product.repository');
vi.mock('@/services/storage.service');

describe('Product Service Integration Tests', () => {
  const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
  
  const mockInput: productService.CreateProductInput = {
    name: 'Joanna Gray Tote',
    baseName: 'Joanna',
    sku: 'Y1886',
    color: 'Gray',
    dimensions: '45x45cm',
    description: 'Luxury tote',
    category: 'Totes',
    price: 1500000,
    stock: 10,
    images: [mockFile],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should upload images and create product in DB', async () => {
      // Arrange
      const mockImageUrls = ['https://supa.com/img1.jpg'];
      vi.mocked(storageService.uploadProductImages).mockResolvedValue(mockImageUrls);
      
      const mockCreatedProduct = {
        id: 'prod-1',
        ...mockInput,
        images: mockImageUrls,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };
      // @ts-expect-error - ignoring type mismatch for simplicity in mock
      vi.mocked(productRepo.createProduct).mockResolvedValue(mockCreatedProduct);

      // Act
      const result = await productService.createProduct(mockInput);

      // Assert
      expect(storageService.uploadProductImages).toHaveBeenCalledWith([mockFile], mockInput.baseName, mockInput.color);
      expect(productRepo.createProduct).toHaveBeenCalledWith({
        name: mockInput.name,
        baseName: mockInput.baseName,
        slug: 'joanna-gray-tote', // auto-generated from name
        sku: mockInput.sku,
        color: mockInput.color,
        dimensions: mockInput.dimensions,
        category: mockInput.category,
        description: mockInput.description,
        price: mockInput.price,
        stock: mockInput.stock,
        images: mockImageUrls,
        is_archived: false
      });
      expect(result).toEqual(mockCreatedProduct);
    });

    it('should always auto-generate slug from name', async () => {
        // Arrange
        vi.mocked(storageService.uploadProductImages).mockResolvedValue([]);
        vi.mocked(productRepo.createProduct).mockResolvedValue({} as ReturnType<typeof productRepo.createProduct> extends Promise<infer T> ? T : never);
  
        // Act
        await productService.createProduct(mockInput);
  
        // Assert
        expect(productRepo.createProduct).toHaveBeenCalledWith(expect.objectContaining({
          slug: 'joanna-gray-tote' // slugified from name
        }));
      });

    it('should reject product creation without images', async () => {
      await expect(
        productService.createProduct({
          ...mockInput,
          images: [],
        })
      ).rejects.toThrow('At least one product image is required');

      expect(storageService.uploadProductImages).not.toHaveBeenCalled();
      expect(productRepo.createProduct).not.toHaveBeenCalled();
    });

    it('should reject product creation when slug cannot be generated', async () => {
      await expect(
        productService.createProduct({
          ...mockInput,
          name: '!!!',
        })
      ).rejects.toThrow('valid slug');

      expect(storageService.uploadProductImages).not.toHaveBeenCalled();
      expect(productRepo.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    const existingProduct = {
        id: 'prod-1',
        name: 'Old Name',
        baseName: 'Old Base',
        sku: 'OLD-SKU',
        color: 'Old Color',
        dimensions: '10x10',
        description: 'Old Desc',
        price: 1000,
        stock: 5,
        slug: 'old-slug',
        images: ['old-img-1.jpg', 'old-img-2.jpg'],
        createdAt: 'date',
        updatedAt: 'date',
        is_archived: false,
        category: null,
    };

    it('should throw error if product not found', async () => {
        vi.mocked(productRepo.getProductById).mockResolvedValue(null);

        await expect(productService.updateProduct({ id: 'prod-1' }))
            .rejects
            .toThrow('Product not found');
    });

    it('should handle image updates (delete removed, upload new)', async () => {
        // Arrange
        vi.mocked(productRepo.getProductById).mockResolvedValue(existingProduct);
        vi.mocked(storageService.uploadProductImages).mockResolvedValue(['new-img.jpg']);
        
        const updateInput: productService.UpdateProductInput = {
            id: 'prod-1',
            name: 'New Name',
            existingImages: ['old-img-1.jpg'], // 'old-img-2.jpg' is removed
            images: [mockFile] // New file added
        };

        // Act
        await productService.updateProduct(updateInput);

        // Assert
        // 1. Check deletion of removed image
        expect(storageService.deleteProductImages).toHaveBeenCalledWith(['old-img-2.jpg']);
        
        // 2. Check upload of new image
        expect(storageService.uploadProductImages).toHaveBeenCalledWith([mockFile], existingProduct.baseName, existingProduct.color, 1);

        // 3. Check DB update with merged images
        expect(productRepo.updateProduct).toHaveBeenCalledWith('prod-1', expect.objectContaining({
            name: 'New Name',
            images: ['old-img-1.jpg', 'new-img.jpg']
        }));
    });

    it('should reject updates that remove all images', async () => {
        vi.mocked(productRepo.getProductById).mockResolvedValue(existingProduct);

        await expect(
          productService.updateProduct({
            id: 'prod-1',
            existingImages: [],
          })
        ).rejects.toThrow('At least one product image is required');

        expect(productRepo.updateProduct).not.toHaveBeenCalled();
    });
  });
});
