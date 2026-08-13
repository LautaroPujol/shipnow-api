import productRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../utils/constants.js';

class ProductService {
  async getAllProducts({ includeOutOfStock = false } = {}) {
    const filter = includeOutOfStock
      ? {}
      : { status: { $ne: PRODUCT_STATUS.OUT_OF_STOCK }, stock: { $gt: 0 } };

    return productRepository.getAll(filter);
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(productData) {
    const alreadyExists = await productRepository.existsByCode(productData.code);
    if (alreadyExists) {
      const error = new Error(`Ya existe un producto con el código "${productData.code}"`);
      error.statusCode = 400;
      throw error;
    }

    const stock = productData.stock ?? 0;
    const status = stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

    return productRepository.create({ ...productData, stock, status });
  }

  async updateProduct(id, updateData) {
    await this.getProductById(id);

    if (updateData.stock !== undefined) {
      updateData.status =
        updateData.stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    return productRepository.updateById(id, updateData);
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    return productRepository.deleteById(id);
  }
}

export default new ProductService();