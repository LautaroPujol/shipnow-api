import mongoose from 'mongoose';
import { PEDIDO_STATUS, PEDIDO_PRIORITY } from '../utils/constants.js';

const pedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productos: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        cantidad: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
    direccionEntrega: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PEDIDO_STATUS),
      default: PEDIDO_STATUS.PENDIENTE,
    },
    prioridad: {
      type: String,
      enum: Object.values(PEDIDO_PRIORITY),
      default: PEDIDO_PRIORITY.MEDIA,
    },
  },
  { timestamps: true }
);

const PedidoModel = mongoose.model('Pedido', pedidoSchema);

export default PedidoModel;