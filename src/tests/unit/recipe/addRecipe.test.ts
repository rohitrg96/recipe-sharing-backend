import { RecipeService } from '../../../services/recipe.service';
import { UserSchema } from '../../../models/User';
import { RecipeSchema } from '../../../models/Recipe';
import { Request, Response } from 'express';
import { msg } from '../../../helper/messages';
import { CustomError } from '../../../utils/customError';

jest.mock('../../../models/User', () => ({
  UserSchema: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../../models/Recipe', () => ({
  RecipeSchema: {
    create: jest.fn(),
  },
}));

const createMocks = (recipeData: any, userId: string | undefined) => {
  const req = {
    body: recipeData,
    user: { id: userId },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('RecipeService addRecipe', () => {
  let recipeService: RecipeService;

  beforeAll(() => {
    recipeService = new RecipeService();
  });

  it('should add a recipe and return 200 status', async () => {
    const mockUser = {
      _id: 'userId',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    const mockRecipe = {
      title: 'Delicious Pasta',
      ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'],
      steps: ['Boil water', 'Cook pasta', 'Add sauce', 'Serve'],
      preparationTime: 30,
      user: 'userId',
      image: null,
    };

    const mockRecipeWithPopulate = {
      ...mockRecipe,
      user: mockUser,
      populate: jest.fn().mockResolvedValue({
        ...mockRecipe,
        user: mockUser,
      }),
    };

    // Mock database behavior
    (UserSchema.findOne as jest.Mock).mockResolvedValue(mockUser);
    (RecipeSchema.create as jest.Mock).mockResolvedValue(mockRecipeWithPopulate);

    const { req, res, next } = createMocks(mockRecipe, 'userId');

    await recipeService.addRecipe(req, res, next);

    expect(UserSchema.findOne).toHaveBeenCalledWith({ _id: 'userId' });
    expect(RecipeSchema.create).toHaveBeenCalledWith({
      ...mockRecipe,
      user: 'userId',
    });

    expect(mockRecipeWithPopulate.populate).toHaveBeenCalledWith('user', 'firstName lastName email');

    expect(res.json).toHaveBeenCalledWith({
      message: msg.recipe.added,
      data: {
        ...mockRecipe,
        user: mockUser,
      },
      status: 200,
      statusMessage: 'Success',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw a CustomError if the user is not found', async () => {
    // Arrange
    const mockRecipe = {
      title: 'Delicious Pasta',
      ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'],
      image: 'image-url',
      steps: ['Boil water', 'Cook pasta', 'Add sauce', 'Serve'],
      preparationTime: 30,
    };

    UserSchema.findOne = jest.fn().mockResolvedValue(null); // User not found

    const { req, res, next } = createMocks(mockRecipe, 'invalidUserId');

    // Act
    await recipeService.addRecipe(req, res, next);

    // Assert
    expect(UserSchema.findOne).toHaveBeenCalledWith({ _id: 'invalidUserId' });
    expect(next).toHaveBeenCalledWith(new CustomError(msg.user.notFound, 400));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle errors and pass them to the next middleware', async () => {
    // Arrange
    const mockRecipe = {
      title: 'Delicious Pasta',
      ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'],
      image: 'image-url',
      steps: ['Boil water', 'Cook pasta', 'Add sauce', 'Serve'],
      preparationTime: 30,
    };

    const mockError = new Error('Database error');
    UserSchema.findOne = jest.fn().mockRejectedValue(mockError);

    const { req, res, next } = createMocks(mockRecipe, 'userId');

    // Act
    await recipeService.addRecipe(req, res, next);

    // Assert
    expect(UserSchema.findOne).toHaveBeenCalledWith({ _id: 'userId' });
    expect(next).toHaveBeenCalledWith(mockError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
