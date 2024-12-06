import { NextFunction, Request, Response } from 'express';
import { jwtConfig } from '../../config/config';
import jwt from 'jsonwebtoken';

export const validateToken = (req: any, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.status(403).json({
      message: 'Access Token Required',
    });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, jwtConfig.secret, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({
        status: 'error',
        message: 'unauthorized',
      });
      return;
    } else {
      req.user = decoded;
      // console.log(req.user);
      next();
    }
  });
};
