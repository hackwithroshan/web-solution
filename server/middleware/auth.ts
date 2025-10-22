// FIX: Add explicit types for Request, Response, and NextFunction.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
// FIX: Import `Multer` directly to bring the namespace into scope for type augmentation.
import Multer from 'multer';
// FIX: Import mongoose to use its Document type, aligning this declaration with the one in `backend/middleware/auth.ts` to resolve a type conflict.
import mongoose from 'mongoose';

// This correctly extends the global Express `Request` interface to include the `user` property,
// resolving type incompatibility issues with Express's router and middleware handlers.
declare global {
  namespace Express {
    // FIX: Removed 'export' from interface declaration, as it's invalid syntax for module augmentation inside `declare global`.
    interface Request {
      // FIX: Changed type to `IUser & mongoose.Document` to match the declaration in `backend/models/User.ts` and resolve a global type conflict.
      user?: IUser & mongoose.Document;
      // FIX: Changed `Express.Multer.File` to `Multer.File`. The `Multer` namespace is declared within the `Express` namespace by the multer types, so it should be accessed directly.
      file?: Multer.File;
    }
  }
}

// FIX: Add explicit Request, Response, and NextFunction types from 'express' to ensure type safety.
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// FIX: Add explicit Request, Response, and NextFunction types from 'express' to ensure type safety.
export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
