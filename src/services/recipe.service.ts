import { IRecipe } from '../models/Recipe';
import { msg } from '../helper/messages';
import { CustomError } from '../utils/customError';
import { HTTP_STATUS } from '../utils/statusCodes';
import { RecipeRepository } from '../repositories/recipeRepository';
import { SearchFilters } from '../types/recipe.type';

export class RecipeService {
  private recipeRepository: RecipeRepository;

  constructor() {
    this.recipeRepository = new RecipeRepository(); // Initialize the RecipeRepository
  }

  /**
   * Add a new recipe to the database.
   *
   * This method checks if the user exists, then creates a new recipe and adds it to the database.
   *
   * @param  recipe - The recipe object containing details of the recipe to be added.
   * @param  userId - The ID of the user who is adding the recipe.
   * @returns - Returns a promise that resolves to an object containing the added recipe.
   * @throws - Throws an error if the user doesn't exist or if there is an issue with recipe creation.
   */
  addRecipe = async (recipe: IRecipe, userId: string) => {
    // Check if the user exists
    const userExist = await this.recipeRepository.findUserById(userId);
    if (!userExist) {
      throw new CustomError(msg.user.notFound, HTTP_STATUS.BAD_REQUEST);
    }

    // Create the new recipe
    const dbRecipe = await this.recipeRepository.createRecipe(recipe, userId);

    return { dbRecipe };
  };

  /**
   * Update an existing recipe in the database.
   *
   * This method checks if the recipe exists and belongs to the user, then updates the recipe details.
   *
   * @param  recipeId - The ID of the recipe to be updated.
   * @param  recipe - The updated recipe details.
   * @param  userId - The ID of the user who is updating the recipe.
   * @returns - Returns a promise that resolves to an object containing the updated recipe.
   * @throws  - Throws an error if the recipe doesn't exist, doesn't belong to the user, or if there is an issue with the update.
   */
  updateRecipe = async (recipeId: string, recipe: IRecipe, userId: string) => {
    // Check if the recipe exists and belongs to the user
    const recipeExist = await this.recipeRepository.findRecipeByIdAndUserId(
      recipeId,
      userId,
    );

    if (!recipeExist) {
      throw new CustomError(msg.recipe.notFound, HTTP_STATUS.BAD_REQUEST);
    }

    // Update the recipe
    const updatedRecipe = await this.recipeRepository.updateRecipeById(
      recipeId,
      recipe,
      userId,
    );

    if (updatedRecipe) {
      return { updatedRecipe };
    } else {
      throw new CustomError('Error updating recipe', HTTP_STATUS.BAD_REQUEST);
    }
  };

  /**
   * Fetch all recipes based on provided search filters, with pagination.
   *
   * @param filters - The search filters for retrieving recipes.
   * @returns A promise that resolves to an object containing recipe data and pagination details.
   * @throws If the aggregation or database query fails.
   */
  getAllRecipes = async ({
    ingredients,
    title,
    minRating,
    maxPreparationTime,
    page = '1',
    limit = '10000000',
  }: SearchFilters) => {
    try {
      // Prepare the aggregation pipeline for recipe data
      const aggregationPipeline =
        this.recipeRepository.getRecipesAggregationPipeline({
          ingredients,
          title,
          minRating,
          maxPreparationTime,
          page,
          limit,
        });

      // Prepare the total count pipeline
      const totalCountPipeline = this.recipeRepository.getTotalCountPipeline({
        ingredients,
        title,
        minRating,
        maxPreparationTime,
        page,
        limit,
      });

      // Execute the aggregation pipelines
      const [recipes, totalCountResult] = await Promise.all([
        this.recipeRepository.aggregateRecipes(aggregationPipeline),
        this.recipeRepository.aggregateRecipes(totalCountPipeline),
      ]);

      // Extract the total count from the result
      const totalRecipes =
        totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

      // Prepare the final response with pagination data
      const finalData = {
        data: recipes,
        pagination: {
          total: totalRecipes,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(totalRecipes / parseInt(limit, 10)),
        },
      };

      return finalData;
    } catch (error: unknown) {
      throw error;
    }
  };
}

// getRecipe = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let recipeId = req.params.recipeId;

//     if (!recipeId) {
//       // Throw CustomError if recipeId is not provided
//       throw new CustomError(msg.recipe.notFound, 400);
//     }

//     let recipeExist = await RecipeSchema.findOne({ _id: recipeId })
//       .populate('user', 'firstName lastName email')
//       .populate('stars.user', 'firstName lastName email')
//       .populate('comments.user', 'firstName lastName email');

//     if (recipeExist) {
//       // Return successful response with the recipe data
//       return responseStatus(res, 200, msg.recipe.fetched, recipeExist);
//     } else {
//       // Throw CustomError if the recipe is not found
//       throw new CustomError('Error fetching recipe details', 400);
//     }
//   } catch (error: any) {
//     // Log the error
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };

// deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let recipeId = req.params.recipeId;
//     let userId = req.user?.id;

//     let deleteRecipe = await RecipeSchema.findByIdAndDelete({
//       _id: recipeId,
//       user: userId,
//     }).populate('user', 'firstName lastName email');

//     if (deleteRecipe) {
//       return responseStatus(res, 200, msg.recipe.deleted, deleteRecipe);
//     } else {
//       // Throw CustomError if the recipe deletion fails
//       throw new CustomError('Error deleting recipe', 400);
//     }
//   } catch (error: any) {
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };

// //logged in user can rate any recipe
// AddRating = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let recipeId = req.params.recipeId;
//     let userId = req.user?.id;
//     let userRating = req.body.rating;

//     let updatedRecipe = await RecipeSchema.findById(recipeId);
//     if (!updatedRecipe) {
//       // Throw CustomError if recipe is not found
//       throw new CustomError(msg.recipe.notFound, 400);
//     }

//     // Check if the user has already rated this recipe
//     const existingRating = updatedRecipe.stars?.find((star) => star.user.toString() === userId);

//     if (existingRating) {
//       // Return error if the user already rated the recipe
//       return responseStatus(res, 409, msg.recipe.alreadyRated, null);
//     } else {
//       // Add a new rating
//       updatedRecipe.stars?.push({ user: userId, rating: userRating });
//     }

//     // Save the updated recipe
//     const ratingAdded = await updatedRecipe.save();

//     if (ratingAdded) {
//       return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
//     } else {
//       // Throw CustomError if the recipe update fails
//       throw new CustomError('Error updating recipe', 400);
//     }
//   } catch (error: any) {
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };

// AddComment = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let recipeId = req.params.recipeId;
//     let userId = req.user?.id;
//     let userComment = req.body.comment;

//     let updatedRecipe = await RecipeSchema.findById(recipeId);
//     if (!updatedRecipe) {
//       // Throw CustomError if recipe is not found
//       throw new CustomError(msg.recipe.notFound, 400);
//     }

//     // Check if the user has already commented this recipe
//     const existingComment = updatedRecipe.comments?.find((comment) => comment.user.toString() === userId);

//     if (existingComment) {
//       // Update the existing comment
//       existingComment.comment = userComment;
//     } else {
//       // Add a new comment
//       updatedRecipe.comments?.push({ user: userId, comment: userComment });
//     }

//     // Save the updated recipe
//     const commentAdded = await updatedRecipe.save();

//     if (commentAdded) {
//       return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
//     } else {
//       // Throw CustomError if the recipe update fails
//       throw new CustomError('Error updating recipe', 400);
//     }
//   } catch (error: any) {
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };

// CheckUserCommentAndRating = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let recipeId = req.params.recipeId;
//     let userId = req.user?.id;

//     let recipeDetails = await RecipeSchema.findOne({ _id: recipeId });
//     if (!recipeDetails) {
//       // Throw CustomError if the recipe is not found
//       throw new CustomError(msg.recipe.notFound, 400);
//     }

//     const checkIfUserhasCommented = recipeDetails.comments?.find((c) => {
//       return c.user._id == userId;
//     });

//     const checkIfUserhasRated = recipeDetails.stars?.find((s) => {
//       return s.user._id == userId;
//     });

//     const data = {
//       userCommented: checkIfUserhasCommented ? true : false,
//       userRated: checkIfUserhasRated ? true : false,
//       checkIfUserhasCommented,
//       checkIfUserhasRated,
//     };

//     return responseStatus(res, 200, 'User feedback on recipe', data);
//   } catch (error: any) {
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };

// uploadImage = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     if (!req.file) {
//       // Throw CustomError if no file is uploaded
//       throw new CustomError(msg.recipe.imageNotFound, 400);
//     }

//     configureCloudinary();

//     cloudinary.uploader
//       .upload_stream(
//         { resource_type: 'auto', folder: 'tasty-tales-images' }, // Automatically detect the file type (image, video, etc.)
//         (error, result) => {
//           if (error) {
//             console.log(error);
//             // Throw CustomError for Cloudinary upload failure
//             return next(new CustomError(msg.recipe.imageNotFound, 400));
//           }
//           return responseStatus(res, 200, msg.recipe.imageAdded, { url: result?.secure_url });
//         },
//       )
//       .end(req.file.buffer); // Send the file buffer to Cloudinary
//   } catch (error: any) {
//     console.error(error);
//     // Forward the error to the global error handler
//     next(error);
//   }
// };
