import { IRecipe, IStar } from '../models/Recipe';
import { msg } from '../helper/messages';
import { CustomError } from '../utils/customError';
import { HTTP_STATUS } from '../utils/statusCodes';
import { RecipeRepository } from '../repositories/recipeRepository';
import { SearchFilters } from '../types/recipe.type';
import mongoose from 'mongoose';
import configureCloudinary from '../config/multer';
import { v2 as cloudinary } from 'cloudinary';

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

  /**
   * Fetch a recipe by its ID, including populated user and related fields.
   *
   * @param recipeId - The ID of the recipe to fetch.
   * @returns - A promise that resolves to the recipe details.
   * @throws  - Throws if the recipe ID is missing or the recipe is not found.
   */
  getRecipe = async (recipeId: string) => {
    try {
      if (!recipeId) {
        // Throw CustomError if recipeId is not provided
        throw new CustomError(msg.recipe.notFound, HTTP_STATUS.NOT_FOUND);
      }

      // Delegate the database query to the repository
      const recipeExist = await this.recipeRepository.findRecipeById(recipeId);

      if (recipeExist) {
        // Return successful response with the recipe data
        return recipeExist;
      } else {
        // Throw CustomError if the recipe is not found
        throw new CustomError(
          'Error fetching recipe details',
          HTTP_STATUS.NOT_FOUND,
        );
      }
    } catch (error: unknown) {
      // Log the error
      throw error;
    }
  };

  /**
   * Add a rating to a recipe by a user.
   *
   * @param recipeId - The ID of the recipe to rate.
   * @param userId - The ID of the user adding the rating.
   * @param userRating - The rating provided by the user (e.g., 1-5).
   * @returns - A promise that resolves to the updated recipe or `null`
   * if the user has already rated the recipe.
   * @throws {CustomError} - Throws if the recipe is not found or the update fails.
   */
  addRating = async (recipeId: string, userId: string, userRating: number) => {
    try {
      // Fetch the recipe by ID
      const updatedRecipe = await this.recipeRepository.findRecipeById(
        recipeId,
      );

      if (!updatedRecipe) {
        // Throw CustomError if recipe is not found
        throw new CustomError(msg.recipe.notFound, HTTP_STATUS.NOT_FOUND);
      }

      // Check if the user has already rated this recipe
      const existingRating = updatedRecipe.stars?.find(
        (star: IStar) => star.user._id.toString() === userId,
      );

      if (existingRating) {
        // Return null if the user has already rated the recipe
        return null;
      } else {
        // Add a new rating
        this.recipeRepository.addNewRating(updatedRecipe, userId, userRating);
        // Save the updated recipe
        const ratingAdded = await this.recipeRepository.saveRecipe(
          updatedRecipe,
        );

        if (ratingAdded) {
          return ratingAdded;
        } else {
          // Throw CustomError if the recipe update fails
          throw new CustomError('Error updating recipe', HTTP_STATUS.NOT_FOUND);
        }
      }
    } catch (error: unknown) {
      console.error(error);
      // Forward the error to the global error handler
      throw error;
    }
  };

  /**
   * Add or update a comment on a recipe.
   *
   * @param  recipeId - The ID of the recipe to comment on.
   * @param  userId - The ID of the user adding the comment.
   * @param  userComment - The comment content.
   * @returns - The updated recipe with the new or updated comment.
   * @throws  - Throws an error if the recipe is not found or if the update fails.
   */
  addComment = async (
    recipeId: string,
    userId: string,
    userComment: string,
  ) => {
    try {
      const updatedRecipe = await this.recipeRepository.findRecipeById(
        recipeId,
      );
      if (!updatedRecipe) {
        throw new CustomError(msg.recipe.notFound, HTTP_STATUS.NOT_FOUND);
      }

      // Check if the user has already commented
      const existingComment = updatedRecipe.comments?.find(
        (comment) => comment.user._id.toString() === userId,
      );

      if (existingComment) {
        // Update the existing comment
        existingComment.comment = userComment;
      } else {
        // Add a new comment
        this.recipeRepository.addNewComment(updatedRecipe, userId, userComment);
      }

      // Save the updated recipe
      const commentAdded = await this.recipeRepository.saveRecipe(
        updatedRecipe,
      );

      if (commentAdded) {
        return updatedRecipe;
      } else {
        throw new CustomError('Error updating recipe', HTTP_STATUS.NOT_FOUND);
      }
    } catch (error: unknown) {
      throw error;
    }
  };

  /**
   * Checks if a user has commented or rated a specific recipe.
   *
   * @param recipeId - The ID of the recipe to check.
   * @param userId - The ID of the user to check for comments and ratings.
   * @returns - An object containing flags indicating if the user has commented or rated,
   *                              and the user's comment and rating details if available.
   * @throws - Throws an error if the recipe is not found or if an unexpected error occurs.
   */
  checkUserCommentAndRating = async (
    recipeId: string,
    userId: mongoose.Types.ObjectId,
  ) => {
    try {
      // Fetch recipe details from the repository
      const recipeDetails = await this.recipeRepository.findRecipeDetails(
        recipeId,
      );

      if (!recipeDetails) {
        // Throw a custom error if the recipe does not exist
        throw new CustomError(msg.recipe.notFound, HTTP_STATUS.NOT_FOUND);
      }

      // Check if the user has commented on the recipe
      const checkIfUserhasCommented = recipeDetails.comments?.find((c) => {
        return c.user._id == userId; // Compare user IDs (loose equality to handle type differences)
      });

      // Check if the user has rated the recipe
      const checkIfUserhasRated = recipeDetails.stars?.find((s) => {
        return s.user._id == userId; // Compare user IDs (loose equality to handle type differences)
      });

      // Prepare the response data
      const data = {
        userCommented: !!checkIfUserhasCommented, // Boolean flag for user comment existence
        userRated: !!checkIfUserhasRated, // Boolean flag for user rating existence
        checkIfUserhasCommented, // User's comment details (if any)
        checkIfUserhasRated, // User's rating details (if any)
      };

      return data; // Return the constructed data object
    } catch (error: unknown) {
      // Forward the error to the global error handler for consistent handling
      throw error;
    }
  };

  /**
   * Uploads an image file to Cloudinary.
   *
   * @param  file - The image file to upload, received from Multer middleware.
   * @returns - Resolves with the uploaded file's URL.
   * @throws - Throws an error if the file is not provided, the upload fails, or another issue occurs.
   */
  uploadImage = async (file: Express.Multer.File | undefined) => {
    try {
      // Check if a file is provided
      if (!file) {
        // Throw CustomError if no file is uploaded
        throw new CustomError(
          msg.recipe.imageNotFound,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      // Wrap the Cloudinary upload stream in a Promise
      const result = await new Promise<{ url: string }>((resolve, reject) => {
        configureCloudinary();
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto', // Automatically detect the file type
            folder: 'tasty-tales-images', // Folder in Cloudinary to store the uploaded images
          },
          (error, result) => {
            if (error) {
              // Reject with a CustomError if upload fails
              return reject(
                new CustomError(
                  error.message || 'Cloudinary upload failed',
                  HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ),
              );
            }
            const url = result?.secure_url;
            if (!url) {
              throw new CustomError(
                'Secure URL missing',
                HTTP_STATUS.NOT_FOUND,
              );
            }
            // Resolve with the uploaded file's secure URL
            resolve({ url: result?.secure_url });
          },
        );

        // Send the file buffer to Cloudinary
        uploadStream.end(file.buffer);
      });

      // Return the uploaded file's URL
      return result;
    } catch (error: unknown) {
      // Check if the error is already a CustomError instance
      if (error instanceof CustomError) {
        throw error;
      }

      // Wrap unknown errors into a CustomError
      throw new CustomError(error as string, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };

  /**
   * Deletes a recipe by its ID and verifies if it belongs to the provided user.
   *
   * @param  recipeId - The ID of the recipe to be deleted.
   * @param userId - The ID of the user attempting to delete the recipe.
   * @returns - Returns the deleted recipe document.
   * @throws - Throws an error if the recipe is not found or deletion fails.
   */
  deleteRecipe = async (recipeId: string, userId: mongoose.Types.ObjectId) => {
    try {
      // Call the database query to delete the recipe
      const deletedRecipe = await this.recipeRepository.deleteRecipeByIdAndUser(
        recipeId,
        userId,
      );

      if (!deletedRecipe) {
        // Throw CustomError if the recipe deletion fails
        throw new CustomError('Error deleting recipe', 400);
      }

      // Return the deleted recipe document
      return deletedRecipe;
    } catch (error: unknown) {
      console.error('Error in deleteRecipe:', error);

      // Re-throw the error to propagate it to the global error handler
      throw error;
    }
  };
}
