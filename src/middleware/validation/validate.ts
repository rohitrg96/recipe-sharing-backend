import { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validationMiddleware = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let dataToValidate: unknown;

    // Handle different HTTP methods and gather data to validate
    switch (req.method) {
      case 'GET':
      case 'DELETE':
        dataToValidate = { ...req.query, ...req.params };
        break;

      case 'POST':
      case 'PUT':
      case 'PATCH':
        dataToValidate = { ...req.body, ...req.params };
        break;

      default:
        res.status(400).json({
          error: {
            message: 'Unsupported HTTP method',
          },
        });
        return;
    }

    // Validate the data using Joi
    const { error } = schema.validate(dataToValidate, { abortEarly: false });

    // If validation fails, return a 400 response with the errors
    if (error) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.details.map((detail) => ({
          field: detail.context?.key,
          message: detail.message,
        })),
      });
      return;
    }

    // If validation passes, move on to the next middleware
    next();
  };
};
