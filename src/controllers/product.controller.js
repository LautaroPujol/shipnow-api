import productService from '../services/product.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ProductController {
  async getAll(req, res, next) {
    try {
      const includeOutOfStock = req.query.includeOutOfStock === 'true';
      const products = await productService.getAllProducts({ includeOutOfStock });
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: products });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: product });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newProduct });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProductController();