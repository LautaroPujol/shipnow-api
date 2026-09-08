import PedidoModel from '../models/pedido.model.js';

class PedidoRepository {
  async getAll(filter = {}, { skip = 0, limit = 0 } = {}) {
    let query = PedidoModel.find(filter)
      .populate('usuario', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    if (limit) query = query.skip(skip).limit(limit);
    return query.lean();
  }

  async countAll(filter = {}) {
    return PedidoModel.countDocuments(filter);
  }

  async getById(id) {
    return PedidoModel.findById(id)
      .populate('usuario', 'firstName lastName email role')
      .lean();
  }

  async create(pedidoData) {
    const created = await PedidoModel.create(pedidoData);
    return created.toObject();
  }

  async updateById(id, updateData) {
    return PedidoModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('usuario', 'firstName lastName email role')
      .lean();
  }

  async deleteById(id) {
    return PedidoModel.findByIdAndDelete(id).lean();
  }

  async insertMany(pedidos) {
    const created = await PedidoModel.insertMany(pedidos);
    return created.map((doc) => doc.toObject());
  }

  async pushComprobante(pedidoId, metadata) {
    return PedidoModel.findByIdAndUpdate(
      pedidoId,
      { $push: { comprobantes: metadata } },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('usuario', 'firstName lastName email role')
      .lean();
  }
}

export default new PedidoRepository();