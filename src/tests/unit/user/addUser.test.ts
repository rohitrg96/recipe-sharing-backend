// userService.test.ts

import { UserService } from '../../../services/user.service';
import { CustomError } from '../../../utils/customError';
import { UserRepository } from '../../../repositories/userRepository';
import { mockUser } from './mock/user.mock'; // Import the mock data
import { msg } from '../../../helper/messages';
import { HTTP_STATUS } from '../../../utils/statusCodes';
import { IUser } from '../../../models/User';

// Mock the UserRepository methods
jest.mock('../../../repositories/userRepository');

describe('UserService - addUser', () => {
  let userService: UserService;
  let mockCreateUser: jest.Mock;
  let mockFindUserByEmail: jest.Mock;
  let mockFindUserById: jest.Mock;

  beforeEach(() => {
    // Initialize mocks
    mockCreateUser = jest.fn();
    mockFindUserByEmail = jest.fn();
    mockFindUserById = jest.fn();

    // Mock the UserRepository instance methods
    UserRepository.prototype.createUser = mockCreateUser;
    UserRepository.prototype.findUserByEmail = mockFindUserByEmail;
    UserRepository.prototype.findUserById = mockFindUserById;

    // Initialize UserService with mocked repository
    userService = new UserService();
  });

  it('should add a user successfully if email does not exist', async () => {
    // Arrange
    mockFindUserByEmail.mockResolvedValue(null); // No user with that email exists
    mockCreateUser.mockResolvedValue(mockUser); // Simulate successful user creation
    mockFindUserById.mockResolvedValue(mockUser); // Return the user data excluding the password

    // Act
    const result = await userService.addUser(mockUser as IUser);

    // Assert
    expect(mockFindUserByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(mockCreateUser).toHaveBeenCalledWith(mockUser);
    expect(mockFindUserById).toHaveBeenCalledWith(mockUser._id);
    expect(result).toEqual(mockUser);
  });

  it('should throw CustomError if email already exists', async () => {
    // Arrange
    mockFindUserByEmail.mockResolvedValue(mockUser); // Simulate email already exists

    // Act & Assert
    await expect(userService.addUser(mockUser as IUser)).rejects.toThrowError(
      new CustomError(msg.user.emailExist, HTTP_STATUS.BAD_REQUEST),
    );
  });
});
