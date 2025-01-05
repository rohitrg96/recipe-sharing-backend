// import { Request, Response } from 'express';
// import {AuthService} from '../../services/auth.service'; // Adjust path as needed
// import UserSchema from '../../models/UserSchema'; // Adjust path as needed
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import responseStatus from '../../utils/responseStatus'; // Your response utility

// let authService = new AuthService();

// jest.mock('../../models/UserSchema');
// jest.mock('bcrypt');
// jest.mock('jsonwebtoken');
// jest.mock('../../utils/responseStatus');

// describe('Login Service', () => {
//   const mockRequest = (body: any): Request => {
//     return {
//       body,
//     } as Request;
//   };

//   const mockResponse = (): Response => {
//     const res: Partial<Response> = {};
//     res.status = jest.fn().mockReturnThis();
//     res.json = jest.fn();
//     return res as Response;
//   };

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return a token for valid credentials', async () => {
//     const req = mockRequest({ userName: 'test@example.com', password: 'password123' });
//     const res = mockResponse();

//     const mockUser = {
//       email: 'test@example.com',
//       password: 'hashedPassword',
//       _id: 'userId123',
//     };

//     // Mock dependencies
//     (UserSchema.findOne as jest.Mock).mockResolvedValue(mockUser);
//     (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
//     (jwt.sign as jest.Mock).mockReturnValue('mockToken');
//     const mockResponseStatus = jest.fn();
//     (responseStatus as jest.Mock).mockImplementation(mockResponseStatus);

//     await login(req, res);

//     expect(UserSchema.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
//     expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');
//     expect(jwt.sign).toHaveBeenCalledWith(
//       { email: 'test@example.com', id: 'userId123' },
//       expect.any(String), // secret
//       { expiresIn: expect.any(String) } // expiration
//     );
//     expect(mockResponseStatus).toHaveBeenCalledWith(res, 200, expect.any(String), { token: 'mockToken' });
//   });

//   it('should return 400 for invalid password', async () => {
//     const req = mockRequest({ userName: 'test@example.com', password: 'wrongPassword' });
//     const res = mockResponse();

//     const mockUser = {
//       email: 'test@example.com',
//       password: 'hashedPassword',
//       _id: 'userId123',
//     };

//     // Mock dependencies
//     (UserSchema.findOne as jest.Mock).mockResolvedValue(mockUser);
//     (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
//     const mockResponseStatus = jest.fn();
//     (responseStatus as jest.Mock).mockImplementation(mockResponseStatus);

//     await login(req, res);

//     expect(UserSchema.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
//     expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
//     expect(mockResponseStatus).toHaveBeenCalledWith(res, 400, expect.any(String), null);
//   });

//   it('should return 400 if the user does not exist', async () => {
//     const req = mockRequest({ userName: 'nonexistent@example.com', password: 'password123' });
//     const res = mockResponse();

//     (UserSchema.findOne as jest.Mock).mockResolvedValue(null);
//     const mockResponseStatus = jest.fn();
//     (responseStatus as jest.Mock).mockImplementation(mockResponseStatus);

//     await login(req, res);

//     expect(UserSchema.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
//     expect(mockResponseStatus).toHaveBeenCalledWith(res, 400, expect.any(String), null);
//   });

//   it('should return 500 for internal errors', async () => {
//     const req = mockRequest({ userName: 'test@example.com', password: 'password123' });
//     const res = mockResponse();

//     (UserSchema.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
//     const mockResponseStatus = jest.fn();
//     (responseStatus as jest.Mock).mockImplementation(mockResponseStatus);

//     await login(req, res);

//     expect(UserSchema.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
//     expect(mockResponseStatus).toHaveBeenCalledWith(res, 500, 'An error occurred while logging In.', null);
//   });
// });
