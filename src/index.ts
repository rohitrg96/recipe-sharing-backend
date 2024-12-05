import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
 
// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe Sharing API');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
