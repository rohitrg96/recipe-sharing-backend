import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import apiRouter from './routes/api.routes';
import { errorHandler } from './middleware/errorHandler/errorHandler';
import rateLimiter from './middleware/security/rateLimiter';
import { applyCSP } from './middleware/security/csp';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 5080;

// Middleware
app.use(express.json());

// Serve Swagger JSON for compatibility in deployed environments
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec); // Serve the Swagger specification
});

// Setup Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    // Pass the swaggerSpec here, not null
    swaggerOptions: {
      url: '/swagger.json', // Point Swagger UI to the JSON file
    },
  }),
);

app.use(cors());

//security measures
app.use(rateLimiter);
app.use(applyCSP);

// Database connection
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe Sharing API');
});

app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default app;
