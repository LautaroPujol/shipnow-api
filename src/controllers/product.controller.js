import productService from '../services/product.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ProductController {
  async getAll(req, res) {
    try {
      const includeOutOfStock = req.query.includeOutOfStock === 'true';
      const products = await productService.getAllProducts({ includeOutOfStock });
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: products });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: product });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newProduct });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }
}

export default new ProductController();