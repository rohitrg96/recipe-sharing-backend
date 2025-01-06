import { UserService } from '../../../services/user.service';
import { UserSchema } from '../../../models/User';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { CustomError } from '../../../utils/customError';
import { msg } from '../../../helper/messages';

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('bcrypt');

const createMocks = (userData: any) => {
  const req = {
    body: userData,
  } as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('UserService addUser', () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService();
  });

  it('should add a user and return 200 status', async () => {
    // Arrange
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const hashedPassword = 'hashedPassword123';
    const createdUser = { _id: 'userId', ...mockUser };
    const limitedFieldsUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    // Mock database queries and bcrypt
    UserSchema.findOne = jest.fn().mockResolvedValue(null); // No duplicate email
    bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);
    UserSchema.create = jest.fn().mockResolvedValue(createdUser);
    UserSchema.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(limitedFieldsUser),
    });

    const { req, res, next } = createMocks(mockUser);

    // Act
    await userService.addUser(req, res, next);

    // Assert
    expect(UserSchema.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(UserSchema.create).toHaveBeenCalledWith({
      ...mockUser,
      password: hashedPassword,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: msg.user.added,
      data: limitedFieldsUser,
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw a CustomError if email already exists', async () => {
    // Arrange
    const mockUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
    };

    UserSchema.findOne = jest.fn().mockResolvedValue(mockUser); // Duplicate email

    const { req, res, next } = createMocks(mockUser);

    // Act
    await userService.addUser(req, res, next);

    // Assert
    expect(UserSchema.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    expect(next).toHaveBeenCalledWith(new CustomError(msg.user.emailExist, 400));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle errors and pass them to the next middleware', async () => {
    // Arrange
    const mockUser = {
      firstName: 'Invalid',
      lastName: 'User',
      email: 'invalid.user@example.com',
      password: 'password123',
    };

    const mockError = new Error('Database error');
    UserSchema.findOne = jest.fn().mockRejectedValue(mockError);

    const { req, res, next } = createMocks(mockUser);

    // Act
    await userService.addUser(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
