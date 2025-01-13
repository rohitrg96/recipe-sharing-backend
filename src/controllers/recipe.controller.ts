import { RecipeService } from '../services/recipe.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';
import { HTTP_STATUS } from '../utils/statusCodes';
import { msg } from '../helper/messages';
import { IRecipe } from '../models/Recipe';
import { SearchFilters } from '../types/recipe.type';

const recipeService = new RecipeService();

export const addRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipe: IRecipe = req.body;
    const userId = req.user?.id;
    const result = await recipeService.addRecipe(recipe, userId);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.added, result);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const recipe: IRecipe = req.body;
    const userId = req.user?.id;

    const result = await recipeService.updateRecipe(recipeId, recipe, userId);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.updated, result);
  } catch (error: unknown) {
    next(error);
  }
};

export const getAllRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      ingredients,
      title,
      minRating,
      maxPreparationTime,
      page,
      limit,
    }: SearchFilters = req.query;

    const result = await recipeService.getAllRecipes({
      ingredients,
      title,
      minRating,
      maxPreparationTime,
      page,
      limit,
    });
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.fetched, result);
  } catch (error: unknown) {
    next(error);
  }
};

// export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const recipe = await recipeService.getRecipe(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.recipe.fetched, recipe);
//   } catch (error: unknown) {
//     next(error);
//   }
// };

// export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     await recipeService.deleteRecipe(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.recipe.deleted);
//   } catch (error: unknown) {
//     next(error);
//   }
// };

// export const addRating = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const rating = await recipeService.addRating(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.rating.added, rating);
//   } catch (error: unknown) {
//     next(error);
//   }
// };

// export const addComment = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const comment = await recipeService.addComment(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.comment.added, comment);
//   } catch (error: unknown) {
//     next(error);
//   }
// };

// export const checkUserCommentAndRating = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = await recipeService.checkUserCommentAndRating(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.commentAndRating.checked, result);
//   } catch (error: unknown) {
//     next(error);
//   }
// };

// export const addImage = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const image = await recipeService.uploadImage(req, res, next);
//     return responseStatus(res, HTTP_STATUS.OK, msg.image.uploaded, image);
//   } catch (error: unknown) {
//     next(error);
//   }
// };
