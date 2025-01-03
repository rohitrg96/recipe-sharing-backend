import { Request, Response, NextFunction } from 'express';
import { UserSchema } from '../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { responseStatus } from '../helper/response';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/jwtconfig';
import { msg } from '../helper/messages';
import { blacklistToken } from '../middleware/authorization/authFunction';
import { CustomError } from '../utils/customError';

export class AuthService {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
          throw new CustomError(msg.user.invalidCredentials, 400);
        }
      } else {
        // console.log('User Not Found');
        throw new CustomError(msg.user.notFound, 400);
      }
    } catch (error: any) {
      console.error(error);
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new CustomError(msg.user.tokenNotFound, 400);
      }
      const decoded = jwt.decode(token) as JwtPayload;
      // console.log(decoded);
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token: Missing expiration time.');
      }
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const ttl = decoded.exp - currentTime; // Remaining time

      blacklistToken(token, ttl);
      return responseStatus(res, 200, msg.user.tokenBlacklisted, token);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
}
