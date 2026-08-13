import UserModel from '../models/user.model.js';

const DEFAULT_PROJECTION = '-password -__v';

class UserRepository {
  async getAll(filter = {}) {
    return UserModel.find(filter, DEFAULT_PROJECTION).lean();
  }

  async getById(id) {
    return UserModel.findById(id, DEFAULT_PROJECTION).lean();
  }

  async getByEmail(email, { includePassword = false } = {}) {
    const projection = includePassword ? '-__v' : DEFAULT_PROJECTION;
    return UserModel.findOne({ email }, projection).lean();
  }

  async create(userData) {
    const created = await UserModel.create(userData);
    const { password, __v, ...safeUser } = created.toObject();
    return safeUser;
  }

  async updateById(id, updateData) {
    return UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select(DEFAULT_PROJECTION)
      .lean();
  }

  async deleteById(id) {
    return UserModel.findByIdAndDelete(id).select(DEFAULT_PROJECTION).lean();
  }

  async existsByEmail(email) {
    const found = await UserModel.exists({ email });
    return Boolean(found);
  }
}

export default new UserRepository();