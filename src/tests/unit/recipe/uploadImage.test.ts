import * as cloudinary from 'cloudinary';
import { RecipeService } from '../../../services/recipe.service';
import { Request, Response } from 'express';
import { msg } from '../../../helper/messages';
import { CustomError } from '../../../utils/customError';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(), // Mock config function
    uploader: {
      upload_stream: jest.fn().mockImplementation((options, callback) => {
        // Simulate a stream-like object with an `end` method
        const stream = {
          end: (buffer: Buffer) => {
            callback(null, { secure_url: 'https://cloudinary.com/image.jpg' });
          },
        };
        return stream;
      }),
    },
  },
}));

const createMocks = (file: any) => {
  const req = {
    file,
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('RecipeService uploadImage', () => {
  let recipeService: RecipeService;

  beforeAll(() => {
    recipeService = new RecipeService();
  });

  it('should upload image successfully and return the image URL', async () => {
    const mockFile = {
      buffer: Buffer.from('image data'),
    };

    const { req, res, next } = createMocks(mockFile);

    // Act
    await recipeService.uploadImage(req, res, next);

    // Assert
    expect(cloudinary.v2.config).toHaveBeenCalled();
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();

    // Ensure the response is correct
    expect(res.json).toHaveBeenCalledWith({
      message: msg.recipe.imageAdded,
      data: { url: 'https://cloudinary.com/image.jpg' },
      status: 200,
      statusMessage: 'Success',
    });

    // Ensure that `next` was NOT called in a successful upload
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw an error if no file is uploaded', async () => {
    const { req, res, next } = createMocks(null);

    // Act
    await recipeService.uploadImage(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(new CustomError(msg.recipe.imageNotFound, 400));
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle Cloudinary upload failure', async () => {
    // Simulate failure for upload_stream mock
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce((options, callback) => {
      callback(new Error('Cloudinary upload failed'), null);
    });

    const mockFile = {
      buffer: Buffer.from('image data'),
    };

    const { req, res, next } = createMocks(mockFile);

    // Act
    await recipeService.uploadImage(req, res, next);

    // Assert
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(new CustomError(msg.recipe.imageNotFound, 400));
    expect(res.json).not.toHaveBeenCalled();
  });
});
