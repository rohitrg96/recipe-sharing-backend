import { NextFunction, Request, Response } from 'express';
import { jwtConfig } from '../../config/jwtconfig';
import jwt from 'jsonwebtoken';
import cache from '../../config/cache';
import { responseStatus } from '../../helper/response';
import { HTTP_STATUS } from '../../utils/statusCodes';
import { msg } from '../../helper/messages';

/**
 * Middleware function to validate JWT token.
 * It checks for the token in the authorization header, verifies it, and decodes the user information.
 * If the token is invalid or missing, the request will be rejected with appropriate error responses.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function to pass control.
 */
export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if the authorization header exists in the request
  if (!req.headers.authorization) {
    // If no token is found, return forbidden response
    responseStatus(res, HTTP_STATUS.FORBIDDEN, msg.user.tokenNotFound, null);
    return;
  }

  // Extract the token from the Authorization header (bearer token)
  const token = req.headers.authorization.split(' ')[1];

  // Check if the token is blacklisted (cached tokens)
  if (cache.get(token)) {
    // If token is blacklisted, deny access
    responseStatus(res, HTTP_STATUS.UNAUTHORIZED, msg.user.AccessDenied, null);
    return;
  }

  // Verify the token using the secret key and callback function
  jwt.verify(token, jwtConfig.secret, (err: unknown, decoded: unknown) => {
    if (err) {
      // If token verification fails, return unauthorized response
      responseStatus(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        msg.user.invalidToken,
        null,
      );
      return;
    } else {
      // If token is valid, decode and attach user data to the request object
      req.user = decoded;
      // Pass control to the next middleware or route handler
      next();
    }
  });
};

/**
 * Function to blacklist a token by adding it to the cache.
 * This prevents any subsequent requests using the blacklisted token.
 *
 * @param {string} token - The JWT token to be blacklisted.
 * @param {number} [ttl=3600] - The time-to-live (TTL) for the blacklisted token in seconds. Defaults to 1 hour.
 */
export const blacklistToken = (token: string, ttl?: number) => {
  const defaultTTL = 3600; // Default TTL is 1 hour (3600 seconds)

  // Add the token to the cache with the specified TTL (or default TTL if not provided)
  cache.set(token, true, ttl || defaultTTL);
};
