import { Request, Response } from 'express';
import { IRecipe, RecipeSchema } from '../models/Recipe';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import { UserSchema } from '../models/User';

interface SearchFilters {
  ingredients?: string;
  minRating?: number;
  maxPreparationTime?: number;
  page?: number;
  limit?: number;
  title?: string;
}

export class RecipeService {
  addRecipe = async (req: Request, res: Response) => {
    try {
      let recipe: IRecipe = req.body;
      let userId = req.user?.id;
      let userExist = await UserSchema.findOne({ _id: userId });
      if (!userExist) {
        return responseStatus(res, 400, msg.user.notFound, null);
      }

      let dbRecipe = await RecipeSchema.create({
        title: recipe.title,
        ingredients: recipe.ingredients,
        image: recipe.image || null,
        steps: recipe.steps,
        preparationTime: recipe.preparationTime,
        user: userId,
      });

      dbRecipe = await dbRecipe.populate('user', 'firstName lastName email');

      if (dbRecipe) {
        return responseStatus(res, 200, msg.recipe.added, dbRecipe);
      } else {
        return responseStatus(res, 400, 'error creating recipe', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while adding recipe.', null);
    }
  };

  updateRecipe = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;
      let recipe: IRecipe = req.body;
      let userId = req.user?.id;

      let recipeExist = await RecipeSchema.findOne({ _id: recipeId, user: userId });
      if (!recipeExist) {
        return responseStatus(res, 400, msg.recipe.notFound, null);
      }

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
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        return responseStatus(res, 400, 'error updating recipe', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while updating recipe.', null);
    }
  };

  getAllRecipes = async (req: Request, res: Response) => {
    try {
      const { ingredients, title, minRating, maxPreparationTime, page = 1, limit = 10 }: SearchFilters = req.query;

      const query: any = {};
      //search recipes based on ingrediants
      if (ingredients && ingredients.length) {
        const ingredientsArr = ingredients.split(',').map((ingredient) => ingredient.trim());
        query.ingredients = {
          $in: ingredientsArr.map((ingredient) => new RegExp(ingredient, 'i')), // Partial case-insensitive match
        };
      }
      // search by title
      if (title !== undefined && title.trim() !== '') {
        query.title = new RegExp(title, 'i');
      }

      // Filter by minimum rating
      if (minRating !== undefined) {
        query.rating = { $gte: +minRating };
      }
      // Filter by maximum preparation time
      if (maxPreparationTime !== undefined) {
        query.preparationTime = { $lte: +maxPreparationTime };
      }

      const pageNumber = parseInt(page as unknown as string, 10);
      const limitNumber = parseInt(limit as unknown as string, 10);

      let recipes = await RecipeSchema.find(query)
        .populate('user', 'firstName lastName email')
        .populate('stars.user', 'firstName lastName email')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const totalRecipes = await RecipeSchema.countDocuments(query);

      const finalData = {
        data: recipes,
        pagination: {
          total: totalRecipes,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalRecipes / limitNumber),
        },
      };

      return responseStatus(res, 200, msg.recipe.fetched, finalData);
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while fetching recipes.', null);
    }
  };

  getRecipe = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;

      if (!recipeId) {
        return responseStatus(res, 400, msg.recipe.notFound, null);
      }

      let recipeExist = await RecipeSchema.findOne({ _id: recipeId })
        .populate('user', 'firstName lastName email')
        .populate('stars.user', 'firstName lastName email')
        .populate('comments.user', 'firstName lastName email');

      if (recipeExist) {
        return responseStatus(res, 200, msg.recipe.fetched, recipeExist);
      } else {
        return responseStatus(res, 400, 'error fetching recipe Details', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while fetching recipe.', null);
    }
  };

  deleteRecipe = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;

      let deleteRecipe = await RecipeSchema.findByIdAndDelete({ _id: recipeId, user: userId }).populate(
        'user',
        'firstName lastName email',
      );

      if (deleteRecipe) {
        return responseStatus(res, 200, msg.recipe.deleted, deleteRecipe);
      } else {
        return responseStatus(res, 400, 'error deleting recipe', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while deleting recipe.', null);
    }
  };

  //logged in user can rate any recipe
  AddRating = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;
      let userRating = req.body.rating;

      let updatedRecipe = await RecipeSchema.findById(recipeId);
      if (!updatedRecipe) {
        return responseStatus(res, 400, msg.recipe.notFound, null);
      }

      //// Check if the user has already rated this recipe
      const existingRating = updatedRecipe.stars?.find((star) => star.user.toString() === userId);

      if (existingRating) {
        // Update the existing rating
        existingRating.rating = userRating;
      } else {
        // Add a new rating
        updatedRecipe.stars?.push({ user: userId, rating: userRating });
      }

      // Save the updated recipe
      const ratingAdded = await updatedRecipe.save();

      if (ratingAdded) {
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        return responseStatus(res, 400, 'error updating recipe', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while updating recipe.', null);
    }
  };

  //logged in user can comment on any recipe
  AddComment = async (req: Request, res: Response) => {
    try {
      let recipeId = req.params.recipeId;
      let userId = req.user?.id;
      let userComment = req.body.comment;

      let updatedRecipe = await RecipeSchema.findById(recipeId);
      if (!updatedRecipe) {
        return responseStatus(res, 400, msg.recipe.notFound, null);
      }

      //// Check if the user has already commented this recipe
      const existingComment = updatedRecipe.comments?.find((comment) => comment.user.toString() === userId);

      if (existingComment) {
        // Update the existing comment
        existingComment.comment = userComment;
      } else {
        // Add a new comment
        updatedRecipe.comments?.push({ user: userId, comment: userComment });
      }

      // Save the updated recipe
      const commnetAdded = await updatedRecipe.save();

      if (commnetAdded) {
        return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
      } else {
        return responseStatus(res, 400, 'error updating recipe', null);
      }
    } catch (error) {
      console.error(error);
      return responseStatus(res, 500, 'An error occurred while updating recipe.', null);
    }
  };
}
