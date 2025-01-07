import { AuthService } from '../../../services/auth.service';
import { UserSchema } from '../../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const createMocks = (loginData: { userName: string; password: string }) => {
  const req = {
    body: loginData,
  } as Request; // Cast to Request type

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('AuthService login', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
  });

  it('should return 200 and a token for valid credentials', async () => {
    // Arrange
    const mockUser = {
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10), // hashed password
    };
    const token = 'mock-jwt-token';

    // Mock database query and bcrypt.compareSync
    UserSchema.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compareSync = jest.fn().mockReturnValue(true);
    jwt.sign = jest.fn().mockReturnValue(token);

    const loginData = {
      userName: 'rohit12@gmil.com',
      password: '123456',
    };

    const { req, res, next } = createMocks(loginData);

    // Act
    await authService.login(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged in successfully',
      data: { token },
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });

  it('should return 400 for invalid credentials (wrong password)', async () => {
    // Arrange
    const mockUser = {
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10), // hashed password
      _id: '12345',
    };

    // Mock database query and bcrypt.compareSync
    UserSchema.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compareSync = jest.fn().mockReturnValue(false);

    const loginData = {
      userName: 'test@example.com',
      password: 'wrongpassword',
    };

    const { req, res, next } = createMocks(loginData);

    // Act
    await authService.login(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid credentials',
        statusCode: 400,
      }),
    );

    // Ensure that the response methods weren't called (because the error was handled via next)
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 for non-existing user', async () => {
    // Arrange
    UserSchema.findOne = jest.fn().mockResolvedValue(null); // Mock no user found in the database

    const loginData = {
      userName: 'nonexistent@example.com',
      password: 'password123',
    };

    const { req, res, next } = createMocks(loginData);

    // Act
    await authService.login(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not found',
        statusCode: 400,
      }),
    );

    // Ensure that the response methods weren't called (because the error was handled via next)
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
