import fs from 'fs';
import userRepository from '../repositories/user.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import entregaRepository from '../repositories/entrega.repository.js';
import UserModel from '../models/user.model.js';
import PedidoModel from '../models/pedido.model.js';
import EntregaModel from '../models/entrega.model.js';
import { TIPOS_DOCUMENTO_USUARIO } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';
import logger from '../config/logger.js';

function buildMetadata(file) {
  return {
    originalName: file.originalname,
    storedName: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
}

/** Borra un archivo ya guardado en disco (usado si algo falla después de subirlo). */
function removeFileSafe(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) logger.error(`No se pudo eliminar el archivo huérfano ${filePath}: ${err.message}`);
  });
}

class UploadService {
  async attachUserDocument(userId, file, tipoDocumento) {
    if (!file) {
      throw createError(ERROR_TYPES.FILE_REQUIRED);
    }

    const usuario = await userRepository.getById(userId);
    if (!usuario) {
      removeFileSafe(file.path);
      logger.warning(`Intento de subir documento a usuario inexistente: ${userId}`);
      throw createError(ERROR_TYPES.USER_NOT_FOUND);
    }

    if (!Object.values(TIPOS_DOCUMENTO_USUARIO).includes(tipoDocumento)) {
      removeFileSafe(file.path);
      logger.warning(`Tipo de documento inválido recibido: "${tipoDocumento}"`);
      throw createError(ERROR_TYPES.INVALID_DOCUMENT_TYPE, {
        details: { tipoDocumento, validos: Object.values(TIPOS_DOCUMENTO_USUARIO) },
      });
    }

    const metadata = { ...buildMetadata(file), tipoDocumento };

    try {
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { $push: { documentos: metadata } },
        { returnDocument: 'after', runValidators: true }
      )
        .select('-password -__v')
        .lean();

      logger.info(`Documento "${tipoDocumento}" cargado correctamente para usuario ${userId}`);
      return updated;
    } catch (error) {
      removeFileSafe(file.path);
      logger.error(`Fallo guardando metadata del documento de usuario ${userId}: ${error.message}`);
      throw createError(ERROR_TYPES.FILE_SAVE_FAILED);
    }
  }

  async attachPedidoComprobante(pedidoId, file) {
    return this.#attachComprobante({
      id: pedidoId,
      file,
      getById: (id) => pedidoRepository.getById(id),
      Model: PedidoModel,
      notFoundError: ERROR_TYPES.PEDIDO_NOT_FOUND,
      populate: [{ path: 'usuario', select: 'firstName lastName email role' }],
      entidad: 'pedido',
    });
  }

  async attachEntregaComprobante(entregaId, file) {
    return this.#attachComprobante({
      id: entregaId,
      file,
      getById: (id) => entregaRepository.getById(id),
      Model: EntregaModel,
      notFoundError: ERROR_TYPES.ENTREGA_NOT_FOUND,
      populate: [
        { path: 'pedido' },
        { path: 'repartidor', select: 'firstName lastName email role' },
      ],
      entidad: 'entrega',
    });
  }

  async #attachComprobante({ id, file, getById, Model, notFoundError, populate, entidad }) {
    if (!file) {
      throw createError(ERROR_TYPES.FILE_REQUIRED);
    }

    const entidadExistente = await getById(id);
    if (!entidadExistente) {
      removeFileSafe(file.path);
      logger.warning(`Intento de subir comprobante a ${entidad} inexistente: ${id}`);
      throw createError(notFoundError);
    }

    const metadata = buildMetadata(file);

    try {
      let query = Model.findByIdAndUpdate(
        id,
        { $push: { comprobantes: metadata } },
        { returnDocument: 'after', runValidators: true }
      );

      for (const p of populate) {
        query = query.populate(p);
      }

      const updated = await query.lean();

      logger.info(`Comprobante asociado correctamente a ${entidad} ${id}`);
      return updated;
    } catch (error) {
      removeFileSafe(file.path);
      logger.error(`Fallo guardando metadata del comprobante de ${entidad} ${id}: ${error.message}`);
      throw createError(ERROR_TYPES.FILE_SAVE_FAILED);
    }
  }
}

export default new UploadService();