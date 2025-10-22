// FIX: Add explicit types for Request, Response, and NextFunction.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
// FIX: Import `Multer` directly to bring the namespace into scope for type augmentation.
import Multer from 'multer';
// FIX: Import mongoose to use its Document type, aligning this declaration with the one in `backend/middleware/auth.ts` to resolve a type conflict.
import mongoose from 'mongoose';

// The `declare global` block has been removed from this deprecated file to prevent global type conflicts with the active `backend/middleware/auth.ts` file.

// FIX: Add explicit Request, Response, and NextFunction types from 'express' to ensure type safety.
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
            // @ts-ignore - req.user is not recognized here because the global augmentation was removed. This is acceptable for a deprecated file.
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
    // @ts-ignore - req.user is not recognized here because the global augmentation was removed. This is acceptable for a deprecated file.
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};