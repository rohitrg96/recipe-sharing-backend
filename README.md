# Recipe-Sharing Platform Backend

This is the backend for the Recipe-Sharing Platform built using Node.js, TypeScript, and Express.js. The backend provides RESTful APIs to manage recipes, ratings, comments, and user authentication.

## Features

### Recipe Management

- **Create Recipe:** API to create recipes with a title, ingredients, steps, and an image.
- **View Recipes:** API to fetch a list of all available recipes.
- **Recipe Details:** API to fetch detailed information about a specific recipe.

### Search & Filter

- **Search by Ingredients:** API to search for recipes by ingredients.
- **Filter by Rating or Time:** API to filter recipes based on rating or preparation time.

### Ratings & Comments

- **Rate Recipes:** API to rate recipes out of 5 stars.
- **Comment on Recipes:** API to leave comments and feedback on recipes.

### User Authentication

- User registration, login, and logout functionality.
- Restrict actions like viewing the detail page, rating, and commenting to authenticated users.

### Features

- **Logging:** Logs application errors and activity for monitoring and debugging purposes using **Winston**.
- **Swagger API Documentation:** Integrated Swagger to auto-generate API documentation for easy exploration and testing.
- **Security Measures:** Implemented security best practices like **Rate Limiting** and **Content Security Policy (CSP)** using **Helmet**.
- **CI/CD:** Configured a Continuous Integration and Deployment pipeline with GitHub Actions for automatic testing, building, and deploying to **Vercel**.

## Tech Stack

- **Node.js**: Server runtime
- **TypeScript**: Type-safe development
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Multer**: File upload handling
- **Cloudinary**: Image hosting and management
- **JWT**: Authentication
- **Winston**: Logging library
- **Swagger**: API documentation
- **Helmet**: Security middleware
- **Rate Limiting**: Prevent brute-force attacks

## Prerequisites

- [Node.js](https://nodejs.org/) installed (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)
- A `.env` file with the following environment variables:

````env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration_time
UPLOADS_DIR=uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rohitrg96/recipe-sharing-backend.git
   cd recipe-sharing-backend

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the `.env` file and configure it with the necessary environment variables.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Build the project (for production):

   ```bash
   npm run build
   ```

6. Start the production server:

   ```bash
   npm start
   ```

## API Endpoints

### Users

- `POST /api/users`: Add a new user
- `PUT /api/users`: Update an existing user (authenticated)
- `GET /api/users/:userId`: Fetch details of a specific user (authenticated)
- `GET /api/users`: Fetch a list of all users (authenticated)
- `DELETE /api/users/:userId`: Delete a user (authenticated)

### Authentication

- `POST /api/auth/login`: Login and get a JWT token
- `POST /api/auth/logout`: Logout and blacklist a jwt token

### Recipes

- `POST /api/recipes`: Create a new recipe (authenticated)
- `GET /api/recipes`: Fetch all recipes
- `GET /api/recipes/:id`: Fetch details of a specific recipe (authenticated)
- `GET /api/recipes?ingredients=&page=&limit=`: Search recipes by ingredients (supports pagination)

### Ratings & Comments

- `PUT /api/recipes/rating/:recipeId`: Rate a recipe (authenticated)
- `PUT /api/recipes/comment/:recipeId`: Add a comment to a recipe (authenticated)

## Project Structure

````

├── src
│ ├── config # Application configuration (e.g., environment setup, constants)
│ ├── controllers # Route handlers
│ ├── helper # Utility functions and reusable logic
│ ├── middleware # Authentication and other middleware
│ ├── models # Mongoose models
│ ├── routes # API routes
│ ├── services # Business logic
│ ├── validators # Joi Validations
│ ├── index.ts # Entry point
├── .env # Environment variables
├── tsconfig.json # TypeScript configuration
├── package.json # Project metadata
├── .prettierrc # Prettier configuration for code formatting
└── .github # GitHub Actions CI/CD pipeline configuration

## Deployment

This backend can be deployed on any Node.js-compatible platform. To deploy on Vercel:

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

````

2. Deploy:

   ```bash
   vercel
   ```

3. Set the environment variables in the Vercel dashboard.

# CI/CD Pipeline

The backend is deployed automatically through a CI/CD pipeline using GitHub Actions. It is configured to build the project, and deploy to Vercel on changes to the main branch.
````
