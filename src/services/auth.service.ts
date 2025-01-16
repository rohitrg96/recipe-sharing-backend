import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/jwtconfig';
import { msg } from '../helper/messages';
import { blacklistToken } from '../middleware/authorization/authFunction';
import { CustomError } from '../utils/customError';
import { HTTP_STATUS } from '../utils/statusCodes';
import { UserRepository } from '../repositories/userRepository'; // Import the UserRepository

/**
 * AuthService class handles the business logic related to authentication
 * operations like login and logout.
 */
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(); // Initialize the UserRepository
  }

  /**
   * Handle user login by validating credentials and generating a JWT token.
   *
   * @param  userName - The user's email or username.
   * @param password - The user's password.
   * @returns - A promise that resolves to an object containing the generated JWT token.
   * @throws - If the user is not found or the password is incorrect.
   */
  login = async (userName: string, password: string) => {
    // Check if the user exists in the database
    const dbUser = await this.userRepository.findUserByEmail(userName);

    if (dbUser) {
      // Validate the password by comparing it with the stored hashed password
      const isValidPass = bcrypt.compareSync(password, dbUser.password);
      if (isValidPass) {
        // If password is correct, generate JWT token for the user
        const token = jwt.sign(
          {
            email: dbUser.email,
            id: dbUser._id,
          },
          jwtConfig.secret, // Secret key for signing the token
          { expiresIn: jwtConfig.expiresIn }, // Token expiration time
        );

        // Send back a successful response with the generated token
        return { token };
      } else {
        // If password is incorrect, throw a CustomError with BAD_REQUEST status
        throw new CustomError(
          msg.user.invalidCredentials,
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    } else {
      // If user is not found, throw a CustomError with BAD_REQUEST status
      throw new CustomError(msg.user.notFound, HTTP_STATUS.BAD_REQUEST);
    }
  };

  /**
   * Handle user logout by blacklisting the JWT token.
   *
   * @param token - The JWT token to be blacklisted.
   * @returns - A promise that resolves to an object containing the blacklisted token.
   * @throws - If the token is not found or the token is invalid.
   */
  logout = async (token: string) => {
    if (!token) {
      throw new CustomError(msg.user.tokenNotFound, 400);
    }
    const decoded = jwt.decode(token) as JwtPayload;
    // Check if the token has an expiration field
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token: Missing expiration time.');
    }
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const ttl = decoded.exp - currentTime; // Remaining time

    blacklistToken(token, ttl);
    return { token };
  };
}
