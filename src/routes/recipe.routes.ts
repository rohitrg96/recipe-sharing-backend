import express from 'express';
import * as recipesController from '../controllers/recipe.controller';
import {
  validateAddRecipe,
  validateUpdateRecipe,
  validateAddRating,
  validateAddComment,
} from '../validator/recipe.validator';
import { validateToken } from '../middleware/authorization/authFunction';

let recipeRouter = express.Router();

recipeRouter.post('/', validateAddRecipe, validateToken, recipesController.AddRecipe);
recipeRouter.put('/:recipeId', validateUpdateRecipe, validateToken, recipesController.UpdateRecipe);
recipeRouter.get('/:recipeId', validateToken, recipesController.GetRecipe);
recipeRouter.get('/', validateToken, recipesController.GetAllRecipes);
recipeRouter.delete('/:recipeId', validateToken, recipesController.DeleteRecipe);
recipeRouter.put('/rating/:recipeId', validateAddRating, validateToken, recipesController.AddRating);
recipeRouter.put('/comment/:recipeId', validateAddComment, validateToken, recipesController.AddComment);

export default recipeRouter;
