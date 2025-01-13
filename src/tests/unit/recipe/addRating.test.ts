import { RecipeService } from '../../../services/recipe.service';
import { RecipeSchema } from '../../../models/Recipe';
import { Request, Response } from 'express';
import { msg } from '../../../helper/messages';
import { CustomError } from '../../../utils/customError';

jest.mock('../../../models/Recipe', () => ({
  RecipeSchema: {
    findById: jest.fn(),
  },
}));

const createMocks = (params: any, body: any) => {
  const req = {
    params,
    body,
    user: { id: 'userId' },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('RecipeService AddRating', () => {
  let recipeService: RecipeService;

  beforeAll(() => {
    recipeService = new RecipeService();
  });

  it('should add a rating to the recipe', async () => {
    const mockRecipe = {
      _id: 'recipeId',
      stars: [],
      save: jest.fn().mockResolvedValue(true),
    };

    (RecipeSchema.findById as jest.Mock).mockResolvedValue(mockRecipe);

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act
    await recipeService.AddRating(req, res, next);

    // Assert
    expect(RecipeSchema.findById).toHaveBeenCalledWith('recipeId');
    expect(mockRecipe.stars).toContainEqual({ user: 'userId', rating: 5 });
    expect(res.json).toHaveBeenCalledWith({
      message: msg.recipe.updated,
      data: mockRecipe,
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return error if the recipe is not found', async () => {
    (RecipeSchema.findById as jest.Mock).mockResolvedValue(null);

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act
    await recipeService.addRating(req, res, next);

    // Assert
    expect(RecipeSchema.findById).toHaveBeenCalledWith('recipeId');
    expect(next).toHaveBeenCalledWith(
      new CustomError(msg.recipe.notFound, 400),
    );
    expect(res.json).not.toHaveBeenCalled();
  });
});
