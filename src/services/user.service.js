import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';

const SALT_ROUNDS = 10;

class UserService {
  async getAllUsers() {
    return userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) {
      throw createError(ERROR_TYPES.USER_NOT_FOUND);
    }
    return user;
  }

  async createUser(userData) {
    const alreadyExists = await userRepository.existsByEmail(userData.email);
    if (alreadyExists) {
      throw createError(ERROR_TYPES.USER_EMAIL_DUPLICATED, {
        message: `Ya existe un usuario con el email "${userData.email}"`,
        details: { email: userData.email },
      });
    }

    const role = Object.values(USER_ROLES).includes(userData.role)
      ? userData.role
      : USER_ROLES.CLIENTE;

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    return userRepository.create({ ...userData, password: hashedPassword, role });
  }

  async updateUser(id, updateData) {
    await this.getUserById(id);

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    if (updateData.role && !Object.values(USER_ROLES).includes(updateData.role)) {
      throw createError(ERROR_TYPES.INVALID_ROLE, {
        message: `El rol "${updateData.role}" no es válido`,
        details: { role: updateData.role, validRoles: Object.values(USER_ROLES) },
      });
    }

    return userRepository.updateById(id, updateData);
  }

  async deleteUser(id) {
    await this.getUserById(id);
    return userRepository.deleteById(id);
  }

  assertIsAdmin(requestingUser) {
    if (!requestingUser || requestingUser.role !== USER_ROLES.ADMIN) {
      throw createError(ERROR_TYPES.VALIDATION_ERROR, {
        message: 'No tenés permisos para realizar esta acción',
      });
    }
  }
}

export default new UserService();