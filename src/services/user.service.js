import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../utils/constants.js';

const SALT_ROUNDS = 10;

class UserService {
  async getAllUsers() {
    return userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async createUser(userData) {
    const alreadyExists = await userRepository.existsByEmail(userData.email);
    if (alreadyExists) {
      const error = new Error(`Ya existe un usuario con el email "${userData.email}"`);
      error.statusCode = 400;
      throw error;
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
      delete updateData.role;
    }

    return userRepository.updateById(id, updateData);
  }

  async deleteUser(id) {
    await this.getUserById(id);
    return userRepository.deleteById(id);
  }
}

export default new UserService();