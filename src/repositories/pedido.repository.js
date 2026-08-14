import PedidoModel from '../models/pedido.model.js';

class PedidoRepository {
  async getAll(filter = {}) {
    return PedidoModel.find(filter)
      .populate('usuario', 'firstName lastName email role')
      .lean();
  }

  async getById(id) {
    return PedidoModel.findById(id)
      .populate('usuario', 'firstName lastName email role')
      .lean();
  }

  async insertMany(pedidos) {
    const created = await PedidoModel.insertMany(pedidos);
    return created.map((doc) => doc.toObject());
  }

  async countAll() {
    return PedidoModel.countDocuments();
  }
}

export default new PedidoRepository();  