import * as cloudinary from 'cloudinary';
import { RecipeService } from '../../../services/recipe.service';
import { CustomError } from '../../../utils/customError';
import { msg } from '../../../helper/messages';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(), // Mock config function
    uploader: {
      upload_stream: jest.fn().mockImplementation((options, callback) => {
        // Simulate a stream-like object with an `end` method
        const stream = {
          end: () => {
            callback(null, { secure_url: 'https://cloudinary.com/image.jpg' });
          },
        };
        return stream;
      }),
    },
  },
}));

describe('RecipeService uploadImage', () => {
  let recipeService: RecipeService;

  beforeAll(() => {
    recipeService = new RecipeService();
  });

  it('should upload image successfully and return the image URL', async () => {
    const mockFile = {
      buffer: Buffer.from('image data'),
    } as Express.Multer.File;

    // Act
    const result = await recipeService.uploadImage(mockFile);

    // Assert
    expect(cloudinary.v2.config).toHaveBeenCalled();
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();
    expect(result).toEqual({ url: 'https://cloudinary.com/image.jpg' });
  });

  it('should throw an error if no file is uploaded', async () => {
    const mockFile = undefined; // Simulate no file

    // Act & Assert
    await expect(recipeService.uploadImage(mockFile)).rejects.toThrowError(
      new CustomError(msg.recipe.imageNotFound, 400),
    );
  });

  it('should handle Cloudinary upload failure', async () => {
    // Simulate failure for upload_stream mock
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        callback(new Error('Cloudinary upload failed'), null);
      },
    );

    const mockFile = {
      buffer: Buffer.from('image data'),
    } as Express.Multer.File;

    // Act & Assert
    await expect(recipeService.uploadImage(mockFile)).rejects.toThrowError(
      new CustomError('Cloudinary upload failed', 500),
    );
  });

  it('should throw an error if Cloudinary secure_url is missing', async () => {
    // Simulate secure_url missing in the response
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        callback(null, { secure_url: undefined });
      },
    );

    const mockFile = {
      buffer: Buffer.from('image data'),
    } as Express.Multer.File;

    // Act & Assert
    await expect(recipeService.uploadImage(mockFile)).rejects.toThrowError(
      new CustomError('Secure URL missing', 404),
    );
  });
});
