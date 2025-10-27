import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import BlogPost from '../models/BlogPost.js';
import ApiError from '../utils/ApiError.js';

const adminRouter = express.Router();
const publicRouter = express.Router();

// Admin Routes
adminRouter.use(protect, admin);

adminRouter.get('/', async (req, res, next) => {
    try {
        const posts = await BlogPost.find({}).sort({ createdAt: -1 }).populate('author', 'name');
        res.json(posts);
    } catch (error) { next(error); }
});

adminRouter.post('/', async (req, res, next) => {
    try {
        if(!req.user) throw new ApiError(401, 'Not Authorized');
        const post = new BlogPost({ ...req.body, author: req.user._id });
        const createdPost = await post.save();
        res.status(201).json(createdPost);
    } catch (error) { next(error); }
});

adminRouter.put('/:id', async (req, res, next) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) throw new ApiError(404, 'Blog post not found');
        res.json(post);
    } catch (error) { next(error); }
});

adminRouter.delete('/:id', async (req, res, next) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) throw new ApiError(404, 'Blog post not found');
        res.json({ message: 'Blog post deleted' });
    } catch (error) { next(error); }
});


// Public Routes
publicRouter.get('/', async (req, res, next) => {
    try {
        const posts = await BlogPost.find({ status: 'published' }).sort({ createdAt: -1 }).populate('author', 'name');
        res.json(posts);
    } catch (error) { next(error); }
});

publicRouter.get('/:slug', async (req, res, next) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' }).populate('author', 'name');
        if (!post) throw new ApiError(404, 'Blog post not found');
        res.json(post);
    } catch (error) { next(error); }
});

export { adminRouter as adminBlogRouter, publicRouter as publicBlogRouter };