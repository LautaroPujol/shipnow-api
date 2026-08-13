import ProductModel from '../models/product.model.js';

const DEFAULT_PROJECTION = '-__v';

class ProductRepository {
  async getAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit } = options;
    let query = ProductModel.find(filter, DEFAULT_PROJECTION).sort(sort);
    if (limit) query = query.limit(limit);
    return query.lean();
  }

  async getById(id) {
    return ProductModel.findById(id, DEFAULT_PROJECTION).lean();
  }

  async getByCode(code) {
    return ProductModel.findOne({ code }, DEFAULT_PROJECTION).lean();
  }

  async create(productData) {
    const created = await ProductModel.create(productData);
    return created.toObject();
  }

  async updateById(id, updateData) {
    return ProductModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select(DEFAULT_PROJECTION)
      .lean();
  }

  async deleteById(id) {
    return ProductModel.findByIdAndDelete(id).select(DEFAULT_PROJECTION).lean();
  }

  async existsByCode(code) {
    const found = await ProductModel.exists({ code });
    return Boolean(found);
  }
}

export default new ProductRepository();