import uploadService from '../services/upload.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class UploadController {
  async uploadUserDocument(req, res, next) {
    try {
      const updated = await uploadService.attachUserDocument(
        req.params.id,
        req.file,
        req.body.tipoDocumento
      );
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async uploadPedidoComprobante(req, res, next) {
    try {
      const updated = await uploadService.attachPedidoComprobante(req.params.id, req.file);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async uploadEntregaComprobante(req, res, next) {
    try {
      const updated = await uploadService.attachEntregaComprobante(req.params.id, req.file);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }
}

export default new UploadController();