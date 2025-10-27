import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

export interface IBlogPost extends Document {
    title: string;
    slug: string;
    content: string;
    author: mongoose.Types.ObjectId | IUser;
    category: string;
    tags: string[];
    featuredImage?: string;
    status: 'published' | 'draft';
    metaTitle?: string;
    metaDescription?: string;
}

const BlogPostSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'Uncategorized' },
    tags: [{ type: String }],
    featuredImage: { type: String },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    metaTitle: { type: String },
    metaDescription: { type: String },
}, { timestamps: true });

const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export default BlogPost;
