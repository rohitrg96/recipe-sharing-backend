import { Request, Response } from 'express';
import { IUser, UserSchema } from '../models/User';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import bcrypt from 'bcrypt';

export class UserService {
  addUser = async (req: Request, res: Response) => {
    let user: IUser = req.body;

    let emailExist = await UserSchema.findOne({ email: user.email });
    if (emailExist) {
      return responseStatus(res, 400, msg.user.emailExist, null);
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
    let dbUser = await UserSchema.create(user);

    const limitedFieldsUser = await UserSchema.findById(dbUser._id).select(
      'firstName lastName email',
    );

    if (dbUser) {
      return responseStatus(res, 200, msg.user.added, limitedFieldsUser);
    } else {
      return responseStatus(res, 400, 'error creating user', dbUser);
    }
  };
}
