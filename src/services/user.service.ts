import { Request, Response, NextFunction } from 'express';
import { IUser, UserSchema } from '../models/User';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/customError';

interface SearchFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user data from the request body
      let user: IUser = req.body;

      // Check if the email already exists in the database
      let emailExist = await UserSchema.findOne({ email: user.email });
      if (emailExist) {
        // If email exists, throw a CustomError with the appropriate message
        throw new CustomError(msg.user.emailExist, 400);
      }

      // Hash the password before saving the user
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);

      // Create the new user document in the database
      let dbUser = await UserSchema.create(user);

      // Select limited fields for the response (exclude password)
      const limitedFieldsUser = await UserSchema.findById(dbUser._id).select('firstName lastName email');

      // Check if the user was successfully created
      if (dbUser) {
        // If the user is created successfully, return a success response
        return responseStatus(res, 200, msg.user.added, limitedFieldsUser);
      } else {
        // If the user creation failed, throw a CustomError
        throw new CustomError('Error creating user', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  // Update User
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user: IUser = req.body;
      let userId = req.user?.id;

      // Check if the user exists
      let userExist = await UserSchema.findOne({ _id: userId });
      if (!userExist) {
        throw new CustomError(msg.user.notFound, 400);
      }

      // Validate the current password if it's provided
      if ((user.email || user.newPassword) && user.password) {
        const isMatch = await bcrypt.compare(user.password, userExist.password);
        if (!isMatch) {
          throw new CustomError(msg.user.invalidCredentials, 400);
        }
      }

      // Check if the new email is already taken by another user
      if (user.email) {
        const emailExist = await UserSchema.findOne({ email: user.email });
        if (emailExist && emailExist.id !== userId) {
          throw new CustomError(msg.user.emailExist, 400);
        }
      }

      // Hash the new password if it's provided
      if (user.newPassword) {
        const saltRounds = 10;
        user.newPassword = await bcrypt.hash(user.newPassword, saltRounds);
      }

      // Update the user's details
      let updatedUser = await UserSchema.findByIdAndUpdate(
        userId,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.newPassword,
        },
        { new: true },
      );

      if (updatedUser) {
        return responseStatus(res, 200, msg.user.updated, updatedUser);
      } else {
        throw new CustomError('Error updating user', 400);
      }
    } catch (error) {
      console.error(error);
      next(error); // Forward the error to the global error handler
    }
  };

  // Get All Users
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, page = 1, limit = 10 }: SearchFilters = req.query;

      const query: any = {};

      // Apply search filters for first name, last name, and email
      if (firstName) query.firstName = new RegExp(firstName, 'i');
      if (lastName) query.lastName = new RegExp(lastName, 'i');
      if (email) query.email = new RegExp(email, 'i');

      const pageNumber = parseInt(page as unknown as string, 10);
      const limitNumber = parseInt(limit as unknown as string, 10);

      // Fetch users with pagination
      let users = await UserSchema.find(query)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const totalUsers = await UserSchema.countDocuments(query);

      const finalData = {
        data: users,
        pagination: {
          total: totalUsers,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
        },
      };

      return responseStatus(res, 200, msg.user.fetched, finalData);
    } catch (error) {
      console.error(error);
      next(error); // Forward the error to the global error handler
    }
  };

  // Get a Single User
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userId = req.params.userId;

      if (!userId) {
        throw new CustomError(msg.user.notFound, 400);
      }

      let userExist = await UserSchema.findOne({ _id: userId });

      if (userExist) {
        return responseStatus(res, 200, msg.user.fetched, userExist);
      } else {
        throw new CustomError('Error fetching user details', 400);
      }
    } catch (error) {
      console.error(error);
      next(error); // Forward the error to the global error handler
    }
  };

  // Delete User
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userId = req.params.userId;

      let deletedUser = await UserSchema.findByIdAndDelete({ _id: userId });

      if (deletedUser) {
        return responseStatus(res, 200, msg.user.deleted, deletedUser);
      } else {
        throw new CustomError('Error deleting user', 400);
      }
    } catch (error) {
      console.error(error);
      next(error); // Forward the error to the global error handler
    }
  };
}
