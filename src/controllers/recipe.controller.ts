import { RecipeService } from '../services/recipe.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';
import { HTTP_STATUS } from '../utils/statusCodes';
import { msg } from '../helper/messages';
import { IRecipe } from '../models/Recipe';
import { SearchFilters } from '../types/recipe.type';
import mongoose from 'mongoose';
import { getCache, setCache, deleteCache } from '../services/cache.service';

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
    await deleteCache(`recipes:All`);
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
    await deleteCache(`recipe:${recipeId}`);
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
    const cacheKey = `recipes:${ingredients || 'all'}:${title || 'all'}:${
      minRating || 'any'
    }:${maxPreparationTime || 'any'}:${page || 1}:${limit || 10}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return responseStatus(
        res,
        HTTP_STATUS.OK,
        msg.recipe.fetched,
        JSON.parse(cachedData),
      );
    }

    const result = await recipeService.getAllRecipes({
      ingredients,
      title,
      minRating,
      maxPreparationTime,
      page,
      limit,
    });
    await setCache(cacheKey, JSON.stringify(result), 180);
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
    const cacheKey = `recipe:${recipeId}`;

    // Check the cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return responseStatus(
        res,
        HTTP_STATUS.OK,
        msg.recipe.fetched,
        JSON.parse(cachedData),
      );
    }

    const result = await recipeService.getRecipe(recipeId);
    await setCache(cacheKey, JSON.stringify(result), 180);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.fetched, result);
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
    const result = await recipeService.deleteRecipe(recipeId, userId);
    await deleteCache(`recipe:${recipeId}`);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.deleted, result);
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
    const result = await recipeService.addRating(recipeId, userId, userRating);
    await deleteCache(`recipe:${recipeId}`);
    if (result) {
      return responseStatus(res, HTTP_STATUS.OK, msg.recipe.updated, result);
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
    const result = await recipeService.addComment(
      recipeId,
      userId,
      userComment,
    );
    await deleteCache(`recipe:${recipeId}`);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.updated, result);
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

    const result = await recipeService.checkUserCommentAndRating(
      recipeId,
      userId,
    );
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.userFeedback, result);
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
    const result = await recipeService.uploadImage(file);
    return responseStatus(res, HTTP_STATUS.OK, msg.recipe.imageAdded, result);
  } catch (error: unknown) {
    next(error);
  }
};
