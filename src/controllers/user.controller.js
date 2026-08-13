import userService from '../services/user.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: users });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: user });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newUser });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }
}

export default new UserController();