import UserModel from '../models/user.model.js';

const DEFAULT_PROJECTION = '-password -__v';

class UserRepository {
  async getAll(filter = {}, { skip = 0, limit = 0 } = {}) {
    let query = UserModel.find(filter, DEFAULT_PROJECTION).sort({ createdAt: -1 });
    if (limit) query = query.skip(skip).limit(limit);
    return query.lean();
  }

  async countAll(filter = {}) {
    return UserModel.countDocuments(filter);
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
  async insertMany(users) {
    const created = await UserModel.insertMany(users);
    return created.map((doc) => {
      const { password, __v, ...safeUser } = doc.toObject();
      return safeUser;
    });
  }
  async pushDocumento(userId, metadata) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $push: { documentos: metadata } },
      { returnDocument: 'after', runValidators: true }
    )
      .select(DEFAULT_PROJECTION)
      .lean();
  }

  async updateById(id, updateData) {
    return UserModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
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