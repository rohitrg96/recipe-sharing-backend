import mongoose from 'mongoose';
import { AuthService } from '../../../services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError } from '../../../utils/customError';
import { msg } from '../../../helper/messages';
import { UserRepository } from '../../../repositories/userRepository';

jest.mock('../../../repositories/userRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService login', () => {
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeAll(() => {
    authService = new AuthService();
    userRepositoryMock = authService[
      'userRepository'
    ] as jest.Mocked<UserRepository>;
  });

  it('should return a token for valid credentials', async () => {
    // Arrange
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10), // hashed password
      firstName: 'John',
      lastName: 'Doe',
      newPassword: '',
    };

    const token = 'mock-jwt-token';

    // Mock user repository and bcrypt
    userRepositoryMock.findUserByEmail = jest.fn().mockResolvedValue(mockUser); // Correctly mock the method
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const loginData = {
      userName: 'test@example.com',
      password: 'password123',
    };

    // Act
    const result = await authService.login(
      loginData.userName,
      loginData.password,
    );

    // Assert
    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.userName,
    );
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginData.password,
      mockUser.password,
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: mockUser.email, id: mockUser._id },
      expect.any(String), // Secret key
      { expiresIn: expect.any(String) }, // Token expiration
    );
    expect(result).toEqual({ token });
  });

  it('should throw a 400 error for invalid credentials (wrong password)', async () => {
    // Arrange
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10), // hashed password
    };

    // Mock user repository and bcrypt
    userRepositoryMock.findUserByEmail = jest.fn().mockResolvedValue(mockUser); // Correctly mock the method
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    const loginData = {
      userName: 'test@example.com',
      password: 'wrongpassword',
    };

    // Act & Assert
    await expect(
      authService.login(loginData.userName, loginData.password),
    ).rejects.toThrow(new CustomError(msg.user.invalidCredentials, 400));

    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.userName,
    );
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginData.password,
      mockUser.password,
    );
  });

  it('should throw a 400 error for a non-existing user', async () => {
    // Arrange
    userRepositoryMock.findUserByEmail = jest.fn().mockResolvedValue(null); // Correctly mock the method

    const loginData = {
      userName: 'nonexistent@example.com',
      password: 'password123',
    };

    // Act & Assert
    await expect(
      authService.login(loginData.userName, loginData.password),
    ).rejects.toThrow(new CustomError(msg.user.notFound, 400));

    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.userName,
    );
  });
});
