import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import apiRouter from './routes/api.routes';
import { errorHandler } from './middleware/errorHandler/errorHandler';
import rateLimiter from './middleware/security/rateLimiter';
import { applyCSP } from './middleware/security/csp';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import logger from './config/logger';

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

// 404 Not Found middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
export default app;
