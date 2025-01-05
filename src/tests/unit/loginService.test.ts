import { AuthService } from '../../services/auth.service'; // Update path as necessary
import { UserSchema } from '../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { responseStatus } from '../../helper/response';
import { Request, Response } from 'express';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

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

    // Act
    const req = {
      body: loginData,
    } as Request; // Cast to Request type

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await authService.login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged in successfully',
      data: { token },
      status: 200,
      statusMessage: 'Success',
    });
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

    // Act
    const req = {
      body: loginData,
    } as Request; // Cast to Request type

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;


    await authService.login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  // it('should return 400 for non-existing user', async () => {
  //   // Arrange
  //   UserSchema.findOne = jest.fn().mockResolvedValue(null);

  //   const loginData = {
  //     userName: 'nonexistent@example.com',
  //     password: 'password123',
  //   };

  //   // Act
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };

  //   await authService.login({ body: loginData }, res);

  //   // Assert
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  // });

  // it('should return 500 if an error occurs', async () => {
  //   // Arrange
  //   const errorMessage = 'Database error';
  //   UserSchema.findOne = jest.fn().mockRejectedValue(new Error(errorMessage));

  //   const loginData = {
  //     userName: 'test@example.com',
  //     password: 'password123',
  //   };

  //   // Act
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };

  //   await authService.login({ body: loginData }, res);

  //   // Assert
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ message: 'An error occurred while logging In.' });
  // });
});
