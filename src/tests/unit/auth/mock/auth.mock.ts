import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const validMockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 10), // hashed password
  firstName: 'John',
  lastName: 'Doe',
  newPassword: '',
};

export const invalidMockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 10), // hashed password
};

export const nonExistentUser = null;

export const loginData = {
  valid: {
    userName: 'test@example.com',
    password: 'password123',
  },
  invalidPassword: {
    userName: 'test@example.com',
    password: 'wrongpassword',
  },
  nonExistent: {
    userName: 'nonexistent@example.com',
    password: 'password123',
  },
};

export const mockToken = 'mock-jwt-token';
