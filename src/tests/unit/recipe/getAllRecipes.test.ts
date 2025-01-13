import { RecipeService } from '../../../services/recipe.service';
import { RecipeRepository } from '../../../repositories/recipeRepository';
import {
  mockRecipes,
  mockTotalCount,
  mockPipeline,
  filtersWithResults,
  filtersWithNoResults,
} from '../recipe/mock/recipe.mock';

jest.mock('../../../repositories/recipeRepository', () => ({
  RecipeRepository: jest.fn().mockImplementation(() => ({
    getRecipesAggregationPipeline: jest.fn(),
    getTotalCountPipeline: jest.fn(),
    aggregateRecipes: jest.fn(),
  })),
}));

describe('RecipeService getAllRecipes', () => {
  let recipeService: RecipeService;
  let recipeRepositoryMock: jest.Mocked<RecipeRepository>;

  beforeAll(() => {
    recipeService = new RecipeService();
    recipeRepositoryMock = recipeService[
      'recipeRepository'
    ] as jest.Mocked<RecipeRepository>;
  });

  it('should fetch all recipes with pagination and filters', async () => {
    recipeRepositoryMock.getRecipesAggregationPipeline.mockReturnValue(
      mockPipeline,
    );
    recipeRepositoryMock.getTotalCountPipeline.mockReturnValue(mockPipeline);
    recipeRepositoryMock.aggregateRecipes
      .mockResolvedValueOnce(mockRecipes)
      .mockResolvedValueOnce(mockTotalCount);

    const result = await recipeService.getAllRecipes(filtersWithResults);

    expect(
      recipeRepositoryMock.getRecipesAggregationPipeline,
    ).toHaveBeenCalledWith(filtersWithResults);
    expect(recipeRepositoryMock.getTotalCountPipeline).toHaveBeenCalledWith(
      filtersWithResults,
    );
    expect(recipeRepositoryMock.aggregateRecipes).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      data: mockRecipes,
      pagination: {
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
      },
    });
  });

  it('should return an empty response if no recipes are found', async () => {
    recipeRepositoryMock.aggregateRecipes
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await recipeService.getAllRecipes(filtersWithNoResults);

    expect(result).toEqual({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  });

  it('should throw an error if the repository methods fail', async () => {
    recipeRepositoryMock.aggregateRecipes.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      recipeService.getAllRecipes(filtersWithNoResults),
    ).rejects.toThrowError('Database error');
  });
});
