import multer from 'multer';
import path from 'path';
import fs from 'fs';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';

const UPLOADS_ROOT = path.resolve('uploads');

const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Tipos MIME permitidos: documentos comunes (PDF/imagen), suficiente para
// documentos de usuario (DNI, licencia) y comprobantes (foto/PDF de entrega).
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Arma un storage de disco para una subcarpeta específica de uploads/
 * (ej. "documentos-usuario" o "comprobantes"), generando nombres únicos
 * para evitar colisiones y conservando la extensión original.
 */
function buildDiskStorage(subfolder) {
  const destinationPath = path.join(UPLOADS_ROOT, subfolder);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(destinationPath, { recursive: true });
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Pasar el error acá hace que Multer corte la carga antes de guardar nada.
    return cb(createError(ERROR_TYPES.INVALID_FILE_TYPE, {
      details: { mimetype: file.mimetype, permitidos: ALLOWED_MIME_TYPES },
    }));
  }
  cb(null, true);
}

/**
 * Fábrica de middlewares de Multer, uno por subcarpeta de destino.
 * Uso: uploadTo('documentos-usuario').single('archivo')
 */
export function uploadTo(subfolder) {
  return multer({
    storage: buildDiskStorage(subfolder),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  });
}