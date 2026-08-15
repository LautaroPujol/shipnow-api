import userService from '../services/user.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: users });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: user });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newUser });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();