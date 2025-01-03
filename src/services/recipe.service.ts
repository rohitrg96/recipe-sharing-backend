import { Request, Response, NextFunction } from 'express';
import { IRecipe, RecipeSchema } from '../models/Recipe';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import { UserSchema } from '../models/User';
import { v2 as cloudinary } from 'cloudinary';
import configureCloudinary from '../config/multer';
import { PipelineStage } from 'mongoose';
import { CustomError } from '../utils/customError';

interface SearchFilters {
  ingredients?: string;
  minRating?: string;
  maxPreparationTime?: string;
  page?: number;
  limit?: number;
  title?: string;
}

export class RecipeService {
  addRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipe: IRecipe = req.body;
      let userId = req.user?.id;

      // Check if the user exists
      let userExist = await UserSchema.findOne({ _id: userId });
      if (!userExist) {
        // User not found, throw CustomError with appropriate message and status code
        throw new CustomError(msg.user.notFound, 400);
      }

      // Create the new recipe
      let dbRecipe = await RecipeSchema.create({
        title: recipe.title,
        ingredients: recipe.ingredients,
        image: recipe.image || null,
        steps: recipe.steps,
        preparationTime: recipe.preparationTime,
        user: userId,
      });

      // Populate the user details in the recipe
      dbRecipe = await dbRecipe.populate('user', 'firstName lastName email');

      if (dbRecipe) {
        // Recipe successfully created, return the response
        return responseStatus(res, 200, msg.recipe.added, dbRecipe);
      } else {
        // Recipe creation failed, throw CustomError with appropriate message and status code
        throw new CustomError('Error creating recipe', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Use next(error) to forward the error to the global error handler
      next(error);
    }
  };

  updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipeId = req.params.recipeId;
      let recipe: IRecipe = req.body;
      let userId = req.user?.id;

      // Check if the recipe exists and belongs to the user
      let recipeExist = await RecipeSchema.findOne({
        _id: recipeId,
        user: userId,
      });

      if (!recipeExist) {
        // Recipe not found, throw CustomError with appropriate message and status code
        throw new CustomError(msg.recipe.notFound, 400);
      }

      // Update the recipe
      let updatedRecipe = await RecipeSchema.findByIdAndUpdate(
        recipeId,
        {
          title: recipe.title,
          ingredients: recipe.ingredients,
          image: recipe.image || null,
          steps: recipe.steps,
          preparationTime: recipe.preparationTime,
          user: userId,
        },
        { new: true }, // Returns the updated document
      ).populate('user', 'firstName lastName email');

      if (updatedRecipe) {
        // Recipe successfully updated, return the response
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        // Recipe update failed, throw CustomError with appropriate message and status code
        throw new CustomError('Error updating recipe', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Use next(error) to forward the error to the global error handler
      next(error);
    }
  };

  getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        ingredients,
        title,
        minRating,
        maxPreparationTime,
        page = 1,
        limit = 10000000,
      }: SearchFilters = req.query;

      const query: any = {};
      // Search recipes based on ingredients
      if (ingredients && ingredients.length) {
        const ingredientsArr = ingredients.split(',').map((ingredient) => ingredient.trim());
        query.ingredients = {
          $in: ingredientsArr.map((ingredient) => new RegExp(ingredient, 'i')), // Partial case-insensitive match
        };
      }

      // Search by title
      if (title !== undefined && title.trim() !== '') {
        query.title = new RegExp(title, 'i');
      }

      // Filter by maximum preparation time
      if (maxPreparationTime !== undefined && maxPreparationTime.trim() !== '') {
        query.preparationTime = { $lte: +maxPreparationTime };
      }

      const pageNumber = parseInt(page as unknown as string, 10);
      const limitNumber = parseInt(limit as unknown as string, 10);

      // Aggregation pipeline for fetching recipes with starsCount and averageStars
      const aggregationPipeline: PipelineStage[] = [
        { $match: query },
        {
          $addFields: {
            starsCount: { $size: { $ifNull: ['$stars', []] } }, // Safely count stars
            averageStars: {
              $cond: [
                { $eq: [{ $size: { $ifNull: ['$stars', []] } }, 0] }, // Check if no stars
                0,
                {
                  $divide: [
                    { $sum: '$stars.rating' }, // Sum of ratings
                    { $size: { $ifNull: ['$stars', []] } }, // Count of ratings
                  ],
                },
              ],
            },
          },
        },
        { $match: { averageStars: { $gte: Number(minRating) || 0 } } }, // Filter by averageStars
        { $sort: { createdAt: -1 } }, // Sort by createdAt
        { $skip: (pageNumber - 1) * limitNumber }, // Pagination
        { $limit: limitNumber }, // Pagination
      ];

      // Execute the aggregation pipeline to fetch recipes
      let recipes = await RecipeSchema.aggregate(aggregationPipeline).exec();

      // Count total number of recipes for pagination
      const totalRecipes = await RecipeSchema.countDocuments();

      const finalData = {
        data: recipes,
        pagination: {
          total: totalRecipes,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalRecipes / limitNumber),
        },
      };

      // Return the successful response with recipes and pagination data
      return responseStatus(res, 200, msg.recipe.fetched, finalData);
    } catch (error: any) {
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipeId = req.params.recipeId;

      if (!recipeId) {
        // Throw CustomError if recipeId is not provided
        throw new CustomError(msg.recipe.notFound, 400);
      }

      let recipeExist = await RecipeSchema.findOne({ _id: recipeId })
        .populate('user', 'firstName lastName email')
        .populate('stars.user', 'firstName lastName email')
        .populate('comments.user', 'firstName lastName email');

      if (recipeExist) {
        // Return successful response with the recipe data
        return responseStatus(res, 200, msg.recipe.fetched, recipeExist);
      } else {
        // Throw CustomError if the recipe is not found
        throw new CustomError('Error fetching recipe details', 400);
      }
    } catch (error: any) {
      // Log the error
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;

      let deleteRecipe = await RecipeSchema.findByIdAndDelete({
        _id: recipeId,
        user: userId,
      }).populate('user', 'firstName lastName email');

      if (deleteRecipe) {
        return responseStatus(res, 200, msg.recipe.deleted, deleteRecipe);
      } else {
        // Throw CustomError if the recipe deletion fails
        throw new CustomError('Error deleting recipe', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  //logged in user can rate any recipe
  AddRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;
      let userRating = req.body.rating;

      let updatedRecipe = await RecipeSchema.findById(recipeId);
      if (!updatedRecipe) {
        // Throw CustomError if recipe is not found
        throw new CustomError(msg.recipe.notFound, 400);
      }

      // Check if the user has already rated this recipe
      const existingRating = updatedRecipe.stars?.find((star) => star.user.toString() === userId);

      if (existingRating) {
        // Return error if the user already rated the recipe
        return responseStatus(res, 409, msg.recipe.alreadyRated, null);
      } else {
        // Add a new rating
        updatedRecipe.stars?.push({ user: userId, rating: userRating });
      }

      // Save the updated recipe
      const ratingAdded = await updatedRecipe.save();

      if (ratingAdded) {
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        // Throw CustomError if the recipe update fails
        throw new CustomError('Error updating recipe', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  AddComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;
      let userComment = req.body.comment;

      let updatedRecipe = await RecipeSchema.findById(recipeId);
      if (!updatedRecipe) {
        // Throw CustomError if recipe is not found
        throw new CustomError(msg.recipe.notFound, 400);
      }

      // Check if the user has already commented this recipe
      const existingComment = updatedRecipe.comments?.find((comment) => comment.user.toString() === userId);

      if (existingComment) {
        // Update the existing comment
        existingComment.comment = userComment;
      } else {
        // Add a new comment
        updatedRecipe.comments?.push({ user: userId, comment: userComment });
      }

      // Save the updated recipe
      const commentAdded = await updatedRecipe.save();

      if (commentAdded) {
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        // Throw CustomError if the recipe update fails
        throw new CustomError('Error updating recipe', 400);
      }
    } catch (error: any) {
      console.error(error);
      // Forward the error to the global error handler
      next(error);
    }
  };

  CheckUserCommentAndRating = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;

      let recipeDetails = await RecipeSchema.findOne({ _id: recipeId });

      const checkIfUserhasCommented = recipeDetails?.comments?.find((c) => {
        return c.user._id == userId;
      });

      const checkIfUserhasRated = recipeDetails?.stars?.find((s) => {
        return s.user._id == userId;
      });

      const data = {
        userCommented: checkIfUserhasCommented ? true : false,
        userRated: checkIfUserhasRated ? true : false,
        checkIfUserhasCommented,
        checkIfUserhasRated,
      };
      return responseStatus(res, 200, 'User feedback on recipe', data);
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while updating recipe.', null);
    }
  };

  uploadImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return responseStatus(res, 400, msg.recipe.imageNotFound, null);
      }

      configureCloudinary();

      cloudinary.uploader
        .upload_stream(
          { resource_type: 'auto', folder: 'tasty-tales-images' }, // Automatically detect the file type (image, video, etc.)
          (error, result) => {
            if (error) {
              console.log(error);
              return responseStatus(res, 400, msg.recipe.imageNotFound, null);
            }
            return responseStatus(res, 200, msg.recipe.imageAdded, { url: result?.secure_url });
          },
        )
        .end(req.file.buffer); // Send the file buffer to Cloudinary
    } catch (error) {
      console.error(error, 1);
      return responseStatus(res, 500, 'An error occurred while updating recipe.', null);
    }
  };
}
