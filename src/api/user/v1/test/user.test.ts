// src/modules/user/v1/test/user.test.ts
import { Request, Response } from 'express';
import * as userController from '../user.controller';
import * as userService from '../user.service';
import { StatusCodes } from 'http-status-codes';
import { generateTempPassword } from '../../../../utils/temppassword';
import { sendWelcomeEmail } from '../../../../utils/sendmail';
import { UserDocument } from '../../../../models/user';

// Mock dependencies
jest.mock('../user.service');
jest.mock('../../../../utils/temppassword');
jest.mock('../../../../utils/sendmail');

const mockRequest = () => {
  const req = {
    body: {},
    params: {},
  } as Request;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('createUser', () => {
    it('should create a user successfully and send welcome email', async () => {
      // Mock data
      const tempPassword = 'tempPassword123';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'employee',
          password: 'hashedPassword'
        })
      } as unknown as UserDocument;

      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee'
      };

      (generateTempPassword as jest.Mock).mockReturnValue(tempPassword);
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      await userController.createUser(req, res);

      expect(generateTempPassword).toHaveBeenCalled();
      expect(userService.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        password: tempPassword
      });
      expect(sendWelcomeEmail).toHaveBeenCalledWith('john@example.com', tempPassword);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee'
      }));
    });

    it('should handle email sending failure gracefully', async () => {
      const tempPassword = 'tempPassword123';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'employee',
          password: 'hashedPassword'
        })
      } as unknown as UserDocument;

      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee'
      };

      (generateTempPassword as jest.Mock).mockReturnValue(tempPassword);
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (sendWelcomeEmail as jest.Mock).mockRejectedValue(new Error('Email failed'));

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        warning: "User created, but failed to send welcome email"
      }));
    });

    it('should handle duplicate email error', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee'
      };

      const duplicateError = new Error('Duplicate email');
      (duplicateError as any).code = 11000;
      (userService.createUser as jest.Mock).mockRejectedValue(duplicateError);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'email already exists' });
    });

    it('should handle server error', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee'
      };

      (userService.createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('getUser', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com', role: 'employee' },
        { _id: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
      ];

      (userService.getUser as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getUser(req, res);

      expect(userService.getUser).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle no users found', async () => {
      (userService.getUser as jest.Mock).mockResolvedValue([]);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'no users are found in the database' });
    });

    it('should handle server error', async () => {
      (userService.getUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'John Doe', email: 'john@example.com' };
      req.params.id = '507f1f77bcf86cd799439011';

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(userService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle missing id parameter', async () => {
      req.params.id = '';

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ messsage: 'missing user id parameter in given url' });
    });

    it('should handle user not found', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'user with given id not found' });
    });

    it('should handle server error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      (userService.getUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('updateUserById', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Updated',
        email: 'john.updated@example.com',
        role: 'admin',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'John Updated',
          email: 'john.updated@example.com',
          role: 'admin'
        })
      } as unknown as UserDocument;

      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { name: 'John Updated', email: 'john.updated@example.com' };

      (userService.updateUserById as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await userController.updateUserById(req, res);

      expect(userService.updateUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: '507f1f77bcf86cd799439011',
        name: 'John Updated',
        email: 'john.updated@example.com',
        role: 'admin'
      }));
    });

    it('should handle missing id parameter', async () => {
      req.params.id = '';

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ messsage: 'mising user id parameter in given url' });
    });

    it('should handle user not found', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { name: 'John Updated' };
      (userService.updateUserById as jest.Mock).mockResolvedValue(null);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'user with given id not found' });
    });

    it('should handle duplicate email error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { email: 'duplicate@example.com' };

      const duplicateError = new Error('Duplicate email');
      (duplicateError as any).code = 11000;
      (userService.updateUserById as jest.Mock).mockRejectedValue(duplicateError);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'email already exists' });
    });

    it('should handle server error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { name: 'John Updated' };
      (userService.updateUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const mockDeletedUser = { _id: '507f1f77bcf86cd799439011', name: 'John Doe' };
      req.params.id = '507f1f77bcf86cd799439011';

      (userService.deleteUserById as jest.Mock).mockResolvedValue(mockDeletedUser);

      await userController.deleteUserById(req, res);

      expect(userService.deleteUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle missing id parameter', async () => {
      req.params.id = '';

      await userController.deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ messsage: 'Missing user ID parameter in given URL' });
    });

    it('should handle user not found', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      (userService.deleteUserById as jest.Mock).mockResolvedValue(null);

      await userController.deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'user with given id not found' });
    });

    it('should handle server error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      (userService.deleteUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'server error' });
    });
  });
});