import EntregaModel from '../models/entrega.model.js';

class EntregaRepository {
  async getAll(filter = {}, { skip = 0, limit = 0 } = {}) {
    let query = EntregaModel.find(filter)
      .populate('pedido')
      .populate('repartidor', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    if (limit) query = query.skip(skip).limit(limit);
    return query.lean();
  }

  async countAll(filter = {}) {
    return EntregaModel.countDocuments(filter);
  }

  async getById(id) {
    return EntregaModel.findById(id)
      .populate('pedido')
      .populate('repartidor', 'firstName lastName email role')
      .lean();
  }

  async create(entregaData) {
    const created = await EntregaModel.create(entregaData);
    return created.toObject();
  }

  async updateById(id, updateData) {
    return EntregaModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('pedido')
      .populate('repartidor', 'firstName lastName email role')
      .lean();
  }

  async deleteById(id) {
    return EntregaModel.findByIdAndDelete(id).lean();
  }

  async insertMany(entregas) {
    const created = await EntregaModel.insertMany(entregas);
    return created.map((doc) => doc.toObject());
  }

  async pushComprobante(entregaId, metadata) {
    return EntregaModel.findByIdAndUpdate(
      entregaId,
      { $push: { comprobantes: metadata } },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('pedido')
      .populate('repartidor', 'firstName lastName email role')
      .lean();
  }
}

export default new EntregaRepository();