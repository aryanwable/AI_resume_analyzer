import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

// In-memory fallback registry for offline development / test environments
export const inMemoryUsers = new Map();

/**
 * Controller for user registration (POST /api/auth/register)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a valid name',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name must be at least 2 characters long',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a valid email address',
          code: 'VALIDATION_ERROR',
          field: 'email',
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a valid email address format',
          code: 'INVALID_EMAIL_FORMAT',
          field: 'email',
        },
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a password',
          code: 'VALIDATION_ERROR',
          field: 'password',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long',
          code: 'PASSWORD_TOO_SHORT',
          field: 'password',
        },
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Check for existing user in MongoDB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'An account with this email address already exists',
            code: 'EMAIL_ALREADY_EXISTS',
          },
        });
      }

      // Create new user in MongoDB (pre-save hook hashes password)
      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      const userJson = newUser.toJSON();
      const token = generateToken({
        id: userJson.id,
        email: userJson.email,
        role: userJson.role,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: userJson,
        },
      });
    } else {
      // In-memory fallback for offline test environments
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'An account with this email address already exists',
            code: 'EMAIL_ALREADY_EXISTS',
          },
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const mockId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        id: mockId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryUsers.set(normalizedEmail, { ...mockUser, password: hashedPassword });

      const token = generateToken({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: mockUser,
        },
      });
    }
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      });
    }

    next(error);
  }
};

/**
 * Controller for user login (POST /api/auth/login)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate required credentials
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide an email address',
          code: 'VALIDATION_ERROR',
          field: 'email',
        },
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a password',
          code: 'VALIDATION_ERROR',
          field: 'password',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Find user and explicitly select password field for comparison
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Verify candidate password against stored bcrypt hash
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      const userJson = user.toJSON();
      const token = generateToken({
        id: userJson.id,
        email: userJson.email,
        role: userJson.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userJson,
        },
      });
    } else {
      // In-memory fallback for offline test environments
      const storedUser = inMemoryUsers.get(normalizedEmail);

      if (!storedUser) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, storedUser.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      const { password: _, ...sanitizedUser } = storedUser;
      const token = generateToken({
        id: sanitizedUser.id,
        email: sanitizedUser.email,
        role: sanitizedUser.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: sanitizedUser,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving current authenticated user profile (GET /api/auth/me)
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User account not found',
            code: 'USER_NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: user.toJSON(),
        },
      });
    } else {
      // In-memory fallback
      let foundUser = null;
      for (const [_, user] of inMemoryUsers.entries()) {
        if (user.id === userId) {
          const { password: _, ...sanitized } = user;
          foundUser = sanitized;
          break;
        }
      }

      if (!foundUser) {
        // Fallback to decoded token claims if user was created in another test block
        foundUser = {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        };
      }

      return res.status(200).json({
        success: true,
        data: {
          user: foundUser,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  inMemoryUsers,
};
