import { RecipeService } from '../../../services/recipe.service';
import { RecipeSchema } from '../../../models/Recipe';
import { Request, Response } from 'express';
import { msg } from '../../../helper/messages';
import { CustomError } from '../../../utils/customError';

jest.mock('../../../models/Recipe', () => ({
  RecipeSchema: {
    aggregate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]), // Mock exec method
    }),
    countDocuments: jest.fn(),
  },
}));

const createMocks = (query: any) => {
  const req = {
    query,
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('RecipeService getAllRecipes', () => {
  let recipeService: RecipeService;

  beforeAll(() => {
    recipeService = new RecipeService();
  });

  it('should fetch all recipes with pagination', async () => {
    const mockRecipes = [
      { title: 'Delicious Pasta', ingredients: ['Pasta', 'Tomato Sauce'], preparationTime: 30 },
      { title: 'Tasty Pizza', ingredients: ['Cheese', 'Tomato'], preparationTime: 20 },
    ];

    // Mock database behavior
    (RecipeSchema.aggregate as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(mockRecipes),
    });
    (RecipeSchema.countDocuments as jest.Mock).mockResolvedValue(2);

    const query = { page: '1', limit: '10' };
    const { req, res, next } = createMocks(query);

    // Act
    await recipeService.getAllRecipes(req, res, next);

    // Assert
    expect(RecipeSchema.aggregate).toHaveBeenCalled();
    expect(RecipeSchema.countDocuments).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: msg.recipe.fetched,
      data: { data: mockRecipes, pagination: { total: 2, page: 1, limit: 10, totalPages: 1 } },
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
