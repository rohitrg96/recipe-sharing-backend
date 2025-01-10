import { UserSchema } from '../models/User';

/**
 * UserRepository class is responsible for interacting with the User collection in the database.
 */
export class UserRepository {
  findUserByEmail = async (email: string) => {
    return await UserSchema.findOne({ email });
  };
}
