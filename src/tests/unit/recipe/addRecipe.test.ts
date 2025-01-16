import { RecipeService } from '../../../services/recipe.service';
import { RecipeRepository } from '../../../repositories/recipeRepository';
import { mockRecipe } from './mock/recipe.mock';
import { IRecipe } from '../../../models/Recipe';

// Mock RecipeRepository directly
jest.mock('../../../repositories/recipeRepository');

describe('RecipeService', () => {
  let recipeService: RecipeService;
  let mockFindUserById: jest.Mock;
  let mockCreateRecipe: jest.Mock;

  beforeEach(() => {
    recipeService = new RecipeService();
    mockFindUserById = jest.fn(); // Explicitly mock the method
    mockCreateRecipe = jest.fn(); // Explicitly mock the method

    // Override the methods on the mock
    RecipeRepository.prototype.findUserById = mockFindUserById;
    RecipeRepository.prototype.createRecipe = mockCreateRecipe;
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should add a recipe successfully if user exists', async () => {
    // Arrange: Mock the findUserById to return a valid user
    mockFindUserById.mockResolvedValue({ _id: 'userId', firstName: 'John' });

    mockCreateRecipe.mockResolvedValue(mockRecipe);

    // Act: Call the addRecipe method
    const result = await recipeService.addRecipe(
      mockRecipe as IRecipe,
      'userId',
    );

    // Assert: Check that the result matches the expected output
    expect(result.dbRecipe).toEqual(mockRecipe);
    expect(mockFindUserById).toHaveBeenCalledWith('userId');
    expect(mockCreateRecipe).toHaveBeenCalledWith(mockRecipe, 'userId');
  });
});
