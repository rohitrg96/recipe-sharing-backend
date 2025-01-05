import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import apiRouter from './routes/api.routes';
import { errorHandler } from './middleware/errorHandler/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 5080;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe Sharing API');
});

app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
export default app;
