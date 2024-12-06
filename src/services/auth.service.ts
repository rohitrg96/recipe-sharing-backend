import { Request, Response } from 'express';
import { UserSchema } from '../models/User';
import jwt from 'jsonwebtoken';
import { responseStatus } from '../helper/response';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/config';
import { msg } from '../helper/messages';

export class AuthService {
  login = async (req: Request, res: Response) => {
    let username = req.body.userName;
    let password = req.body.password;
    let dbUser = await UserSchema.findOne({ email: username });
    if (dbUser) {
      let isValidPass = bcrypt.compareSync(password, dbUser.password);
      if (isValidPass) {
        const token = jwt.sign(
          {
            email: dbUser.email,
            id: dbUser._id,
          },
          jwtConfig.secret,
          { expiresIn: jwtConfig.expiresIn },
        );
        return responseStatus(res, 200, msg.user.loginSuccess, { token });
      } else {
        console.log('Invalid credentials');
        return responseStatus(res, 400, msg.user.invalidCredentials, null);
      }
    } else {
      console.log('Invalid credentials');

      return responseStatus(res, 400, msg.user.invalidCredentials, null);
    }
  };
}
