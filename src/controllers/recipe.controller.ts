import { RecipeService } from '../services/recipe.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';
import { HTTP_STATUS } from '../utils/statusCodes';
import { msg } from '../helper/messages';
import { IRecipe } from '../models/Recipe';
import { SearchFilters } from '../types/recipe.type';
import mongoose from 'mongoose';

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

export const getRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const recipe = await recipeService.getRecipe(recipeId);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.fetched, recipe);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const userId: mongoose.Types.ObjectId = req.user?.id;
    const deleteRecipe = await recipeService.deleteRecipe(recipeId, userId);
    return responseStatus(
      res,
      HTTP_STATUS.OK,
      msg.recipe.deleted,
      deleteRecipe,
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const addRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const userId: string = req.user.id;
    const userRating: number = req.body.rating;
    const rating = await recipeService.addRating(recipeId, userId, userRating);
    if (rating) {
      return responseStatus(res, HTTP_STATUS.OK, msg.recipe.updated, rating);
    } else {
      return responseStatus(
        res,
        HTTP_STATUS.ALREADY_EXISTED,
        msg.recipe.alreadyExist,
        null,
      );
    }
  } catch (error: unknown) {
    next(error);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const userId: string = req.user?.id;
    const userComment: string = req.body.comment;
    const comment = await recipeService.addComment(
      recipeId,
      userId,
      userComment,
    );
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.updated, comment);
  } catch (error: unknown) {
    next(error);
  }
};

export const checkUserCommentAndRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId;
    const userId: mongoose.Types.ObjectId = req.user?.id;

    const data = await recipeService.checkUserCommentAndRating(
      recipeId,
      userId,
    );
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.userFeedback, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const addImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    const image = await recipeService.uploadImage(file);

    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.imageAdded, image);
  } catch (error: unknown) {
    next(error);
  }
};
