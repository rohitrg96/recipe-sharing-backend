import { RecipeService } from '../../../services/recipe.service';
import { RecipeRepository } from '../../../repositories/recipeRepository';
import { CustomError } from '../../../utils/customError';
import { msg } from '../../../helper/messages';
// import { IStar } from '../../../models/Recipe';

jest.mock('../../../repositories/recipeRepository', () => ({
  RecipeRepository: jest.fn().mockImplementation(() => ({
    findRecipeById: jest.fn(),
    addNewRating: jest.fn(),
    saveRecipe: jest.fn(),
  })),
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

describe('RecipeService addRating', () => {
  let recipeService: RecipeService;
  let recipeRepositoryMock: jest.Mocked<RecipeRepository>;

  beforeAll(() => {
    recipeService = new RecipeService();
    recipeRepositoryMock = recipeService[
      'recipeRepository'
    ] as jest.Mocked<RecipeRepository>;
  });

  it('should add a rating to the recipe', async () => {
    const mockRecipe = {
      _id: 'recipeId',
      stars: [],
    };

    recipeRepositoryMock.findRecipeById.mockResolvedValue(mockRecipe);
    recipeRepositoryMock.addNewRating.mockResolvedValue(true);
    recipeRepositoryMock.saveRecipe.mockResolvedValue(mockRecipe);

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act
    const result = await recipeService.addRating(
      params.recipeId,
      req.user.id,
      body.rating,
    );

    // Assert
    expect(recipeRepositoryMock.findRecipeById).toHaveBeenCalledWith(
      'recipeId',
    );
    expect(recipeRepositoryMock.addNewRating).toHaveBeenCalledWith(
      mockRecipe,
      'userId',
      5,
    );
    expect(recipeRepositoryMock.saveRecipe).toHaveBeenCalledWith(mockRecipe);
    expect(result).toEqual(mockRecipe);
    expect(res.json).toHaveBeenCalledWith({
      message: msg.recipe.updated,
      data: mockRecipe,
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return null if the user has already rated the recipe', async () => {
    const mockRecipe = {
      _id: 'recipeId',
      stars: [{ user: { _id: 'userId' }, rating: 5 }],
    };

    recipeRepositoryMock.findRecipeById.mockResolvedValue(mockRecipe);

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act
    const result = await recipeService.addRating(
      req.params.recipeId,
      req.user.id,
      body.rating,
    );

    // Assert
    expect(recipeRepositoryMock.findRecipeById).toHaveBeenCalledWith(
      'recipeId',
    );
    expect(recipeRepositoryMock.addNewRating).not.toHaveBeenCalled();
    expect(recipeRepositoryMock.saveRecipe).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw an error if the recipe is not found', async () => {
    recipeRepositoryMock.findRecipeById.mockResolvedValue(null);

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act
    await recipeService.addRating(
      req.params.recipeId,
      req.user.id,
      body.rating,
    );

    // Assert
    expect(recipeRepositoryMock.findRecipeById).toHaveBeenCalledWith(
      'recipeId',
    );
    expect(next).toHaveBeenCalledWith(
      new CustomError(msg.recipe.notFound, 404),
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should throw an error if updating the recipe fails', async () => {
    const mockRecipe = { _id: 'recipeId', stars: [] };
    recipeRepositoryMock.findRecipeById.mockResolvedValue(mockRecipe);
    recipeRepositoryMock.addNewRating.mockResolvedValue(true);
    recipeRepositoryMock.saveRecipe.mockResolvedValue(null); // Simulate failure to save

    const params = { recipeId: 'recipeId' };
    const body = { rating: 5 };
    const { req, res, next } = createMocks(params, body);

    // Act & Assert
    await expect(
      recipeService.addRating(req.params.recipeId, req.user.id, body.rating),
    ).rejects.toThrowError(new CustomError('Error updating recipe', 404));
    expect(next).not.toHaveBeenCalled();
  });
});
