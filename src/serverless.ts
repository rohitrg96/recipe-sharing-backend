import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './index';

export default (req: VercelRequest, res: VercelResponse) => {
  app(req as any, res as any); // Use the Express app to handle requests
};
