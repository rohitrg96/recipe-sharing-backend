import { Request, Response } from 'express';
import { IRecipe, RecipeSchema } from '../models/Recipe';
import { responseStatus } from '../helper/response';
import { msg } from '../helper/messages';
import { UserSchema } from '../models/User';

export class RecipeService {
  addRecipe = async (req: Request, res: Response) => {
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
      user: userId,
    });

    if (dbRecipe) {
      return responseStatus(res, 200, msg.recipe.added, dbRecipe);
    } else {
      return responseStatus(res, 400, 'error creating recipe', null);
    }
  };

  updateRecipe = async (req: Request, res: Response) => {
    let recipeId = req.params.recipeId;
    console.log(recipeId);
    let recipe: IRecipe = req.body;
    let userId = req.user?.id;

    let recipeExist = await RecipeSchema.findOne({ _id: recipeId, user: userId });
    if (!recipeExist) {
      return responseStatus(res, 400, msg.recipe.notFound, null);
    }

    const updatedRecipe = await RecipeSchema.findByIdAndUpdate(
      recipeId,
      {
        title: recipe.title,
        ingredients: recipe.ingredients,
        image: recipe.image || null,
        steps: recipe.steps,
        user: userId,
      },
      { new: true }, // Returns the updated document
    );

    if (updatedRecipe) {
      return responseStatus(res, 200, msg.recipe.updated, updatedRecipe);
    } else {
      return responseStatus(res, 400, 'error creating recipe', null);
    }
  };
}
