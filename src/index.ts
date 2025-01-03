import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import apiRouter from './routes/api.routes';
import rateLimiter from './middleware/rateLimiter/rateLimiter';

dotenv.config();

const app = express();
const port = process.env.PORT || 5080;

// Middleware
app.use(express.json());
app.use(cors());
app.use(rateLimiter);

// Database connection
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe Sharing API');
});

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default app;
