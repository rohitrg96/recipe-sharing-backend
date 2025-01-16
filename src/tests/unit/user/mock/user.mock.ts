import mongoose from 'mongoose';
// import { IUser } from '../../../../models/User'; // Adjust the import path as needed

export const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  newPassword: 'newPassword123', // Ensure you include all required fields for IUser
};
