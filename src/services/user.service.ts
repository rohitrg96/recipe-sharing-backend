import { msg } from '../helper/messages';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/customError';
import { IUser } from '../models/User';
import { UserRepository } from '../repositories/userRepository';
import { HTTP_STATUS } from '../utils/statusCodes';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(); // Initialize the UserRepository
  }

  /**
   * Adds a new user to the database after verifying and hashing the password.
   *
   * @param  user - The user details to be added to the database.
   * @returns - Returns the newly created user with limited fields (excluding the password).
   * @throws - Throws an error if the email already exists or user creation fails.
   */
  addUser = async (user: IUser) => {
    // Check if the email already exists in the database
    const emailExist = await this.userRepository.findUserByEmail(user.email);
    if (emailExist) {
      // If email exists, throw a CustomError with the appropriate message
      throw new CustomError(msg.user.emailExist, HTTP_STATUS.BAD_REQUEST);
    }

    // Hash the password before saving the user
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);

    // Create the new user document in the database
    const dbUser: IUser = await this.userRepository.createUser(user);

    // Select limited fields for the response (exclude password)
    const limitedFieldsUser = await this.userRepository.findUserById(
      dbUser._id,
    );

    // Check if the user was successfully created
    if (dbUser) {
      // If the user is created successfully, return a success response
      return limitedFieldsUser;
    } else {
      // If the user creation failed, throw a CustomError
      throw new CustomError('Error creating user', HTTP_STATUS.BAD_REQUEST);
    }
  };
}
