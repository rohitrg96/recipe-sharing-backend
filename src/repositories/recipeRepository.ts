import { IRecipe, RecipeSchema } from '../models/Recipe';
import { UserSchema } from '../models/User';
import { SearchFilters } from '../types/recipe.type';
import { PipelineStage, FilterQuery } from 'mongoose';
import mongoose from 'mongoose';

export class RecipeRepository {
  // Find a recipe by its ID and check if the user owns it
  findRecipeByIdAndUserId = async (recipeId: string, userId: string) => {
    return await RecipeSchema.findOne({ _id: recipeId, user: userId }).populate(
      'user',
      'firstName lastName email',
    );
  };

  // Create a new recipe
  createRecipe = async (recipeData: IRecipe, userId: string) => {
    return await RecipeSchema.create({
      ...recipeData,
      user: userId,
    });
  };

  // Update an existing recipe by its ID
  updateRecipeById = async (
    recipeId: string,
    recipeData: IRecipe,
    userId: string,
  ) => {
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

  /**
   * Get aggregation pipeline for recipes based on provided filters.
   *
   * This method builds an aggregation pipeline to filter, sort, and paginate recipes
   * based on the provided query parameters.
   *
   * @param {SearchFilters} params - The filters used to query recipes.
   * @returns {PipelineStage[]} - The aggregation pipeline to be used in MongoDB.
   */
  getRecipesAggregationPipeline = ({
    ingredients,
    title,
    minRating,
    maxPreparationTime,
    page = '1',
    limit = '100000',
  }: SearchFilters): PipelineStage[] => {
    const query: FilterQuery<IRecipe> = {}; // Query to be used in the aggregation pipeline

    // Search recipes based on ingredients if provided
    if (ingredients && ingredients.length) {
      const ingredientsArr = ingredients
        .split(',')
        .map((ingredient) => ingredient.trim());
      query.ingredients = {
        $in: ingredientsArr.map((ingredient) => new RegExp(ingredient, 'i')), // Partial case-insensitive match
      };
    }

    // Search by title if provided
    if (title && title.trim() !== '') {
      query.title = new RegExp(title, 'i'); // Case-insensitive match for title
    }

    // Filter by maximum preparation time if provided
    if (maxPreparationTime && maxPreparationTime.trim() !== '') {
      query.preparationTime = { $lte: +maxPreparationTime }; // Less than or equal to maxPreparationTime
    }

    const pageNumber = parseInt(page, 10); // Convert page to integer
    const limitNumber = parseInt(limit, 10); // Convert limit to integer

    // Return the aggregation pipeline
    return [
      { $match: query }, // Filter documents based on the constructed query
      {
        $addFields: {
          starsCount: { $size: { $ifNull: ['$stars', []] } }, // Count the stars, default to empty array if null
          averageStars: {
            $cond: [
              { $eq: [{ $size: { $ifNull: ['$stars', []] } }, 0] }, // If no stars are present, set averageStars to 0
              0,
              {
                $divide: [
                  { $sum: '$stars.rating' }, // Sum of all ratings
                  { $size: { $ifNull: ['$stars', []] } }, // Count the number of stars
                ],
              },
            ],
          },
        },
      },
      { $match: { averageStars: { $gte: Number(minRating) || 0 } } }, // Filter by averageStars
      { $sort: { createdAt: -1 } }, // Sort by creation date, descending order
      { $skip: (pageNumber - 1) * limitNumber }, // Skip documents based on pagination
      { $limit: limitNumber }, // Limit the number of results per page
    ];
  };

  /**
   * Get total count pipeline for recipes based on provided filters.
   *
   * This method builds a pipeline to calculate the total number of recipes
   * that match the provided filters, without actually retrieving the recipe data.
   *
   * @param {SearchFilters} params - The filters used to query recipes.
   * @returns {PipelineStage[]} - The aggregation pipeline to get the total count.
   */
  getTotalCountPipeline = ({
    ingredients,
    title,
    minRating,
    maxPreparationTime,
  }: SearchFilters): PipelineStage[] => {
    const query: FilterQuery<IRecipe> = {}; // Query to be used in the aggregation pipeline

    // Search recipes based on ingredients if provided
    if (ingredients && ingredients.length) {
      const ingredientsArr = ingredients
        .split(',')
        .map((ingredient) => ingredient.trim());
      query.ingredients = {
        $in: ingredientsArr.map((ingredient) => new RegExp(ingredient, 'i')), // Partial case-insensitive match
      };
    }

    // Search by title if provided
    if (title && title.trim() !== '') {
      query.title = new RegExp(title, 'i'); // Case-insensitive match for title
    }

    // Filter by maximum preparation time if provided
    if (maxPreparationTime && maxPreparationTime.trim() !== '') {
      query.preparationTime = { $lte: +maxPreparationTime }; // Less than or equal to maxPreparationTime
    }

    // Return the pipeline to calculate total count
    return [
      {
        $addFields: {
          averageStars: {
            $cond: [
              { $eq: [{ $size: { $ifNull: ['$stars', []] } }, 0] }, // If no stars are present, set averageStars to 0
              0,
              {
                $divide: [
                  { $sum: '$stars.rating' }, // Sum of all ratings
                  { $size: { $ifNull: ['$stars', []] } }, // Count the number of stars
                ],
              },
            ],
          },
        },
      },
      { $match: { ...query, averageStars: { $gte: Number(minRating) || 0 } } }, // Filter by averageStars
      { $count: 'totalCount' }, // Count the total number of recipes matching the query
    ];
  };

  // Method to execute aggregation query
  aggregateRecipes = async (aggregationPipeline: PipelineStage[]) => {
    return await RecipeSchema.aggregate(aggregationPipeline).exec();
  };

  findRecipeById = async (recipeId: string): Promise<IRecipe | null> => {
    return RecipeSchema.findOne({ _id: recipeId })
      .populate('user', 'firstName lastName email')
      .populate('stars.user', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName email');
  };

  /**
   * Add a new rating to the recipe.
   *
   * @param recipe - The recipe document.
   * @param userId - The ID of the user adding the rating.
   * @param rating - The rating provided by the user.
   */
  addNewRating = (recipe: IRecipe, userId: string, rating: number): void => {
    const objectId = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId
    recipe.stars?.push({ user: objectId, rating });
  };

  /**
   * Save the updated recipe document.
   *
   * @param recipe - The recipe document to save.
   * @returns  - A promise that resolves to the updated recipe.
   */
  saveRecipe = async (recipe: IRecipe) => {
    return recipe.save();
  };

  /**
   * Add a new comment to the recipe.
   *
   * @param {IRecipe} recipe - The recipe to add the comment to.
   * @param {string} userId - The ID of the user adding the comment.
   * @param {string} userComment - The comment content.
   */
  addNewComment(recipe: IRecipe, userId: string, userComment: string): void {
    const objectId = new mongoose.Types.ObjectId(userId);
    recipe.comments?.push({ user: objectId, comment: userComment });
  }

  findRecipeDetails = async (recipeId: string) => {
    return RecipeSchema.findOne({ _id: recipeId });
  };

  deleteRecipeByIdAndUser = async (
    recipeId: string,
    userId: mongoose.Types.ObjectId,
  ) => {
    return RecipeSchema.findOneAndDelete({
      _id: recipeId,
      user: userId,
    }).populate('user', 'firstName lastName email');
  };
}
