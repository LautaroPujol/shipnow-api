import mongoose from 'mongoose';
import { USER_ROLES, TIPOS_DOCUMENTO_USUARIO } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CLIENTE,
    },
    documentos: [
      {
        originalName: { type: String, required: true },
        storedName: { type: String, required: true },
        path: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        tipoDocumento: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;