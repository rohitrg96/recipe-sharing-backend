import { Request, Response } from 'express';
import { IUser, UserSchema } from '../models/User';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import bcrypt from 'bcrypt';

interface SearchFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  addUser = async (req: Request, res: Response) => {
    try {
      let user: IUser = req.body;

      let emailExist = await UserSchema.findOne({ email: user.email });
      if (emailExist) {
        return responseStatus(res, 400, msg.user.emailExist, null);
      }

      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
      let dbUser = await UserSchema.create(user);

      const limitedFieldsUser = await UserSchema.findById(dbUser._id).select('firstName lastName email');

      if (dbUser) {
        return responseStatus(res, 200, msg.user.added, limitedFieldsUser);
      } else {
        return responseStatus(res, 400, 'error creating user', dbUser);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while adding user.', null);
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      let user: IUser = req.body;
      let userId = req.user?.id;

      let userExist = await UserSchema.findOne({ _id: userId });
      if (!userExist) {
        return responseStatus(res, 400, msg.user.notFound, null);
      }

      if ((user.email || user.newPassword) && user.password) {
        const isMatch = await bcrypt.compare(user.password, userExist.password);
        if (!isMatch) {
          return responseStatus(res, 400, msg.user.invalidCredentials, null);
        }
      }
      if (user.email) {
        const emailexist = await UserSchema.findOne({
          email: user.email,
        });
        if (emailexist && emailexist.id !== userId) {
          return responseStatus(res, 400, msg.user.emailExist, null);
        }
      }
      const saltRounds = 10;
      user.newPassword = await bcrypt.hash(user.newPassword, saltRounds);

      let updatedUser = await UserSchema.findByIdAndUpdate(
        userId,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.newPassword,
        },
        { new: true }, // Returns the updated document
      );

      if (updatedUser) {
        return responseStatus(res, 200, msg.user.updated, updatedUser);
      } else {
        return responseStatus(res, 400, 'error updating user', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while updating user.', null);
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, page = 1, limit = 10 }: SearchFilters = req.query;

      const query: any = {};

      // search by firstName
      if (firstName !== undefined && firstName.trim() !== '') {
        query.firstName = new RegExp(firstName, 'i');
      }

      // search by LastName
      if (lastName !== undefined && lastName.trim() !== '') {
        query.lastName = new RegExp(lastName, 'i');
      }
      // search by email
      if (email !== undefined && email.trim() !== '') {
        query.email = new RegExp(email, 'i');
      }

      const pageNumber = parseInt(page as unknown as string, 10);
      const limitNumber = parseInt(limit as unknown as string, 10);

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
      return responseStatus(res, 500, 'An error occurred while fetching users.', null);
    }
  };

  getUser = async (req: Request, res: Response) => {
    try {
      let userId = req.params.userId;

      if (!userId) {
        return responseStatus(res, 400, msg.user.notFound, null);
      }

      let userExist = await UserSchema.findOne({ _id: userId });

      if (userExist) {
        return responseStatus(res, 200, msg.user.fetched, userExist);
      } else {
        return responseStatus(res, 400, 'error fetching user Details', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while fetching user.', null);
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      let userId = req.params.userId;

      let deletUser = await UserSchema.findByIdAndDelete({ _id: userId });

      if (deletUser) {
        return responseStatus(res, 200, msg.user.deleted, deletUser);
      } else {
        return responseStatus(res, 400, 'error deleting user', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while deleting user.', null);
    }
  };
}
