/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Recipe management endpoints
 */

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Add a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []  # Ensures that the user is authenticated via a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ingredients
 *               - steps
 *               - preparationTime
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the recipe
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of ingredients required for the recipe
 *               image:
 *                 type: string
 *                 description: The URL or path of the recipe image (optional)
 *               steps:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Step-by-step instructions for preparing the recipe
 *               preparationTime:
 *                 type: integer
 *                 description: The time required to prepare the recipe in minutes
 *     responses:
 *       200:
 *         description: Recipe successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Recipe successfully added."
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Spaghetti Bolognese"
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Spaghetti", "Tomato Sauce", "Ground Beef"]
 *                     image:
 *                       type: string
 *                       example: "https://example.com/spaghetti-bolognese.jpg"
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Cook the spaghetti", "Prepare the sauce", "Combine ingredients"]
 *                     preparationTime:
 *                       type: integer
 *                       example: 30
 *                     user:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *       400:
 *         description: Invalid data or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "An error occurred while creating the recipe."
 */
/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes with optional filters and pagination
 *     tags: [Recipes]
 *     parameters:
 *       - name: ingredients
 *         in: query
 *         description: A comma-separated list of ingredients to filter by
 *         required: false
 *         schema:
 *           type: string
 *       - name: title
 *         in: query
 *         description: Title of the recipe to filter by
 *         required: false
 *         schema:
 *           type: string
 *       - name: minRating
 *         in: query
 *         description: Minimum average rating of recipes to filter by
 *         required: false
 *         schema:
 *           type: number
 *       - name: maxPreparationTime
 *         in: query
 *         description: Maximum preparation time to filter by
 *         required: false
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of recipes per page for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10000000
 *     responses:
 *       200:
 *         description: A list of recipes matching the filters with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Recipes successfully fetched."
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Spaghetti Bolognese"
 *                           ingredients:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Spaghetti", "Tomato Sauce", "Ground Beef"]
 *                           image:
 *                             type: string
 *                             example: "https://example.com/spaghetti-bolognese.jpg"
 *                           preparationTime:
 *                             type: integer
 *                             example: 30
 *                           averageStars:
 *                             type: number
 *                             example: 4.5
 *                           starsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-01T12:00:00Z"
 *                           user:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                                 example: "John"
 *                               lastName:
 *                                 type: string
 *                                 example: "Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john.doe@example.com"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: Invalid filters or pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid filter parameters."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "An error occurred while fetching recipes."
 */
