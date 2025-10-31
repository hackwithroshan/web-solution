import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import Multer from 'multer';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    // FIX: Removed 'export' from interface declaration, as it's invalid syntax for module augmentation inside `declare global`.
    interface Request {
      user?: IUser;
      file?: Multer.File;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                throw new Error("Server configuration error: JWT Secret not found.");
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as Secret);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                // Use next() to pass the error to the errorHandler
                return next(new ApiError(401, 'User associated with this token no longer exists.'));
            }

            req.user = user;
            next();
        } catch (error) {
            // Catch JWT errors (expired, malformed) and pass them to the errorHandler
            return next(error);
        }
    }

    if (!token) {
        // If no token is found, pass an error to the errorHandler
        return next(new ApiError(401, 'Not authorized, no token provided.'));
    }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // Use next() to pass the authorization error to the errorHandler
        next(new ApiError(403, 'Not authorized as an admin'));
    }
};

export const support = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'support')) {
        next();
    } else {
        next(new ApiError(403, 'Not authorized for this resource'));
    }
};