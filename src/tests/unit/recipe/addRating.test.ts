import { RecipeService } from '../../../services/recipe.service';
import { RecipeRepository } from '../../../repositories/recipeRepository';
import { CustomError } from '../../../utils/customError';

jest.mock('../../../repositories/recipeRepository', () => {
  return {
    RecipeRepository: jest.fn().mockImplementation(() => {
      return {
        findRecipeById: jest.fn(), // Mock the findRecipeById method
        saveRecipe: jest.fn(),
        addNewRating: jest.fn(),
      };
    }),
  };
});

describe('RecipeService - addRating', () => {
  let recipeService: RecipeService;
  let recipeRepositoryMock: jest.Mocked<RecipeRepository>;

  beforeEach(() => {
    recipeRepositoryMock =
      new RecipeRepository() as jest.Mocked<RecipeRepository>;
    recipeService = new RecipeService();
    (recipeService as any).recipeRepository = recipeRepositoryMock; // Mock the repository
  });

  it('should throw an error if the recipe is not found', async () => {
    // Arrange
    recipeRepositoryMock.findRecipeById.mockResolvedValue(null); // Mock the method properly

    const recipeId = 'invalidRecipeId';
    const userId = 'testUserId';
    const userRating = 5;

    // Act & Assert
    await expect(
      recipeService.addRating(recipeId, userId, userRating),
    ).rejects.toThrow(CustomError);

    await expect(
      recipeService.addRating(recipeId, userId, userRating),
    ).rejects.toThrow('Recipe not found');
  });
});
