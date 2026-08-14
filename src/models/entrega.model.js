import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.js';

const entregaSchema = new mongoose.Schema(
  {
    pedido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pedido',
      required: true,
    },
    repartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    fechaEstimada: {
      type: Date,
    },
    fechaEntrega: {
      type: Date,
    },
    entregado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const EntregaModel = mongoose.model('Entrega', entregaSchema);

export default EntregaModel;