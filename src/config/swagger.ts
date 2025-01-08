import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe Sharing API',
      version: '1.0.0',
      description: 'API documentation for the Recipe Sharing application',
    },
    servers: [
      {
        url: 'http://localhost:5080',
        description: 'Development server',
      },
      {
        url: 'https://recipe-sharing-backend-theta.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, specifies the format of the token
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply globally (optional)
      },
    ],
  },
  apis: ['./src/docs/*.docs.ts'], // Adjust paths as needed
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
