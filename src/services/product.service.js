import productRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';

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
      throw createError(ERROR_TYPES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async createProduct(productData) {
    const alreadyExists = await productRepository.existsByCode(productData.code);
    if (alreadyExists) {
      throw createError(ERROR_TYPES.PRODUCT_CODE_DUPLICATED, {
        message: `Ya existe un producto con el código "${productData.code}"`,
        details: { code: productData.code },
      });
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