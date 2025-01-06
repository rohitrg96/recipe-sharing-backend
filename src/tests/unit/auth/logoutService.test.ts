import { AuthService } from '../../../services/auth.service';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { blacklistToken } from '../../../middleware/authorization/authFunction';
// import { responseStatus } from '../../../helper/response';
// import { CustomError } from '../../../utils/customError';
// import { msg } from '../../../helper/messages';

const createMocks = (logoutData: { authorization: string }) => {
  const req = {
    headers: { authorization: logoutData.authorization },
  } as Request; // Cast to Request type

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('AuthService logout', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
  });

  it('should return 200 and blacklist the token for a valid token', async () => {
    // Arrange
    const token = 'mock-jwt-token';
    const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour expiration

    // Mock JWT decoding and blacklistToken function
    jwt.decode = jest.fn().mockReturnValue(decodedToken);

    const logoutData = {
      authorization: `Bearer ${token}`,
    };

    const { req, res, next } = createMocks(logoutData);

    // Act
    await authService.logout(req, res, next);

    // Assert
    expect(jwt.decode).toHaveBeenCalledWith(token);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token blacklisted successfully',
      data: token,
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });

  it('should return 400 if token is not provided', async () => {
    // Arrange
    const logoutData = {
      authorization: '',
    };

    const { req, res, next } = createMocks(logoutData);

    // Act
    await authService.logout(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token is required for logout',
        statusCode: 400,
      }),
    );
    // Ensure that the response methods weren't called (because the error was handled via next)
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 if token is invalid', async () => {
    // Arrange
    const invalidToken = 'invalid-token';
    const decodedToken = null; // Invalid token scenario

    // Mock JWT decoding to return null
    jwt.decode = jest.fn().mockReturnValue(decodedToken);

    const logoutData = {
      authorization: `Bearer ${invalidToken}`,
    };

    const { req, res, next } = createMocks(logoutData);

    // Act
    await authService.logout(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token: Missing expiration time.',
      }),
    );
    // Ensure that the response methods weren't called (because the error was handled via next)
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next() if there is an unexpected error', async () => {
    // Arrange
    const token = 'mock-jwt-token';
    const error = new Error('Unexpected error');

    // Mock JWT decoding to throw an error
    jwt.decode = jest.fn().mockImplementation(() => {
      throw error;
    });

    const logoutData = {
      authorization: `Bearer ${token}`,
    };

    const { req, res, next } = createMocks(logoutData);

    // Act
    await authService.logout(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(error);
  });
});
