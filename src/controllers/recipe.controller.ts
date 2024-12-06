import { RecipeService } from '../services/recipe.service';
import { Request, Response } from 'express';
import { responseStatus } from '../helper/response';

let recipeService = new RecipeService();

export const AddRecipe = (req: Request, res: Response) => {
  try {
    return recipeService.addRecipe(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const UpdateRecipe = (req: Request, res: Response) => {
  try {
    return recipeService.updateRecipe(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};
