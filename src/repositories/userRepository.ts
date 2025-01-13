import { UserSchema } from '../models/User';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

/**
 * UserRepository class is responsible for interacting with the User collection in the database.
 */
export class UserRepository {
  findUserByEmail = async (email: string) => {
    return await UserSchema.findOne({ email });
  };

  createUser = async (user: IUser) => {
    return UserSchema.create(user);
  };

  findUserById = async (userId: mongoose.Types.ObjectId) => {
    return UserSchema.findById(userId).select('firstName lastName email');
  };
}
