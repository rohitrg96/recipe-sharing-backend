// import mongoose from 'mongoose';
import { AuthService } from '../../../services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError } from '../../../utils/customError';
import { msg } from '../../../helper/messages';
import { UserRepository } from '../../../repositories/userRepository';
import {
  validMockUser,
  invalidMockUser,
  nonExistentUser,
  loginData,
  mockToken,
} from './mock/auth.mock';

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
    userRepositoryMock.findUserByEmail = jest
      .fn()
      .mockResolvedValue(validMockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    // Act
    const result = await authService.login(
      loginData.valid.userName,
      loginData.valid.password,
    );

    // Assert
    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.valid.userName,
    );
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginData.valid.password,
      validMockUser.password,
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: validMockUser.email, id: validMockUser._id },
      expect.any(String), // Secret key
      { expiresIn: expect.any(String) }, // Token expiration
    );
    expect(result).toEqual({ token: mockToken });
  });

  it('should throw a 400 error for invalid credentials (wrong password)', async () => {
    // Arrange
    userRepositoryMock.findUserByEmail = jest
      .fn()
      .mockResolvedValue(invalidMockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    // Act & Assert
    await expect(
      authService.login(
        loginData.invalidPassword.userName,
        loginData.invalidPassword.password,
      ),
    ).rejects.toThrow(new CustomError(msg.user.invalidCredentials, 400));

    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.invalidPassword.userName,
    );
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginData.invalidPassword.password,
      invalidMockUser.password,
    );
  });

  it('should throw a 400 error for a non-existing user', async () => {
    // Arrange
    userRepositoryMock.findUserByEmail = jest
      .fn()
      .mockResolvedValue(nonExistentUser);

    // Act & Assert
    await expect(
      authService.login(
        loginData.nonExistent.userName,
        loginData.nonExistent.password,
      ),
    ).rejects.toThrow(new CustomError(msg.user.notFound, 400));

    expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(
      loginData.nonExistent.userName,
    );
  });
});
