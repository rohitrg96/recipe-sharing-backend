import express from 'express';
import * as recipesController from '../controllers/recipe.controller';
import {
  validateAddRecipe,
  validateUpdateRecipe,
  validateAddRating,
  validateAddComment,
} from '../validator/recipe.validator';
import { validateToken } from '../middleware/authorization/authFunction';
import multer from 'multer';
const upload = multer();

let recipeRouter = express.Router();

recipeRouter.post('/', validateAddRecipe, validateToken, recipesController.AddRecipe);
recipeRouter.put('/:recipeId', validateUpdateRecipe, validateToken, recipesController.UpdateRecipe);
recipeRouter.get('/:recipeId', validateToken, recipesController.GetRecipe);
recipeRouter.get('/', recipesController.GetAllRecipes);
recipeRouter.delete('/:recipeId', validateToken, recipesController.DeleteRecipe);
recipeRouter.put('/rating/:recipeId', validateAddRating, validateToken, recipesController.AddRating);
recipeRouter.put('/comment/:recipeId', validateAddComment, validateToken, recipesController.AddComment);
recipeRouter.post('/upload-image', validateToken, upload.single('image'), recipesController.AddImage);
recipeRouter.get('/user-feedback/:recipeId', validateToken, recipesController.CheckUserCommentAndRating);
export default recipeRouter;
