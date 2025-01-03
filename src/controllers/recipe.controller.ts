import { RecipeService } from '../services/recipe.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';

let recipeService = new RecipeService();

export const AddRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.addRecipe(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const UpdateRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.updateRecipe(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const GetAllRecipes = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.getAllRecipes(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const GetRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.getRecipe(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const DeleteRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.deleteRecipe(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const AddRating = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.AddRating(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const AddComment = (req: Request, res: Response, next: NextFunction) => {
  try {
    return recipeService.AddComment(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const CheckUserCommentAndRating = (req: Request, res: Response) => {
  try {
    return recipeService.CheckUserCommentAndRating(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const AddImage = (req: Request, res: Response) => {
  try {
    return recipeService.uploadImage(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};
