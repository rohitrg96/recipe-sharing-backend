import express from 'express';
import * as recipesController from '../controllers/recipe.controller';
import { validateAddRecipe, validateUpdateRecipe } from '../validator/recipe.validator';
import { validateToken } from '../middleware/authorization/authFunction';

let recipeRouter = express.Router();

recipeRouter.post('/', validateAddRecipe, validateToken, recipesController.AddRecipe);
recipeRouter.put('/:recipeId', validateUpdateRecipe, validateToken, recipesController.UpdateRecipe);
recipeRouter.get('/:recipeId', validateToken, recipesController.GetRecipeById);
recipeRouter.get('/', validateToken, recipesController.GetAllRecipes);

export default recipeRouter;
