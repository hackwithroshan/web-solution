import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
    title: string;
    slug: string;
    content: string;
    status: 'published' | 'draft';
    metaTitle?: string;
    metaDescription?: string;
}

const PageSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    metaTitle: { type: String },
    metaDescription: { type: String },
}, { timestamps: true });

const Page = mongoose.model<IPage>('Page', PageSchema);
export default Page;
