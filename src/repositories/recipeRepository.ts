// repositories/recipeRepository.ts
import { IRecipe, RecipeSchema } from '../models/Recipe';
import { UserSchema } from '../models/User';

export class RecipeRepository {
  // Find a recipe by its ID and check if the user owns it
  findRecipeByIdAndUserId = async (recipeId: string, userId: string) => {
    return await RecipeSchema.findOne({ _id: recipeId, user: userId }).populate('user', 'firstName lastName email');
  };

  // Create a new recipe
  createRecipe = async (recipeData: IRecipe, userId: string) => {
    return await RecipeSchema.create({
      ...recipeData,
      user: userId,
    });
  };

  // Update an existing recipe by its ID
  updateRecipeById = async (recipeId: string, recipeData: IRecipe, userId: string) => {
    return await RecipeSchema.findByIdAndUpdate(
      recipeId,
      { ...recipeData, user: userId },
      { new: true }, // Returns the updated document
    ).populate('user', 'firstName lastName email');
  };

  // Find a user by their ID
  findUserById = async (userId: string) => {
    return await UserSchema.findOne({ _id: userId });
  };
}
